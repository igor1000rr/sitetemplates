<?php

namespace App\Jobs;

use App\Models\Deployment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessDeployment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 300; // 5 минут макс

    public function __construct(
        public Deployment $deployment
    ) {}

    public function handle(): void
    {
        $d = $this->deployment;
        $d->markDeploying();
        $d->appendLog("Начало деплоя шаблона #{$d->template_id}");

        try {
            // 1. Скачиваем ZIP из S3
            $template = $d->template;
            if (!$template?->zip_path) {
                throw new \Exception('ZIP-файл шаблона не найден');
            }

            $d->appendLog("Скачивание ZIP: {$template->zip_path}");
            $zipContent = Storage::disk('s3')->get($template->zip_path);
            $tmpZip = tempnam(sys_get_temp_dir(), 'deploy_') . '.zip';
            file_put_contents($tmpZip, $zipContent);

            // 2. Распаковываем
            $extractDir = sys_get_temp_dir() . '/deploy_' . $d->id;
            @mkdir($extractDir, 0755, true);

            $zip = new \ZipArchive();
            if ($zip->open($tmpZip) !== true) {
                throw new \Exception('Не удалось открыть ZIP');
            }
            $zip->extractTo($extractDir);
            $zip->close();
            @unlink($tmpZip);

            $d->appendLog("ZIP распакован: " . count(scandir($extractDir)) . " файлов");

            // 3. Загружаем на хостинг
            match ($d->method) {
                'ftp' => $this->uploadFtp($d, $extractDir),
                'sftp' => $this->uploadSftp($d, $extractDir),
                default => throw new \Exception("Метод {$d->method} не поддерживается"),
            };

            // Cleanup
            $this->removeDir($extractDir);

            $d->appendLog("Деплой завершён успешно!");
            $d->markCompleted();

            \App\Models\Notification::pushNotification(
                $d->user_id, 'deploy', 'Шаблон установлен',
                "Шаблон успешно установлен на {$d->host}",
                '/account'
            );

        } catch (\Throwable $e) {
            Log::error("Deployment #{$d->id} failed: {$e->getMessage()}");
            $d->appendLog("ОШИБКА: {$e->getMessage()}");
            $d->markFailed($e->getMessage());

            \App\Models\Notification::pushNotification(
                $d->user_id, 'deploy', 'Ошибка установки',
                "Не удалось установить шаблон: {$e->getMessage()}",
                '/account'
            );
        }
    }

    private function uploadFtp(Deployment $d, string $localDir): void
    {
        $d->appendLog("Подключение FTP: {$d->host}:{$d->port}");

        $ftp = @ftp_connect($d->host, $d->port, 30);
        if (!$ftp) throw new \Exception("Не удалось подключиться к FTP {$d->host}:{$d->port}");

        if (!@ftp_login($ftp, $d->username, $d->decrypted_password)) {
            ftp_close($ftp);
            throw new \Exception('Ошибка авторизации FTP');
        }

        ftp_pasv($ftp, true);
        $d->appendLog("FTP подключён, режим PASV");

        // Создаём удалённую директорию
        @ftp_mkdir($ftp, $d->remote_path);

        // Рекурсивная загрузка
        $uploaded = $this->ftpUploadDir($ftp, $localDir, $d->remote_path);
        $d->appendLog("Загружено файлов: {$uploaded}");

        ftp_close($ftp);
    }

    private function ftpUploadDir($ftp, string $localDir, string $remoteDir): int
    {
        $count = 0;
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($localDir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($items as $item) {
            $relative = str_replace($localDir, '', $item->getPathname());
            $remotePath = $remoteDir . str_replace('\\', '/', $relative);

            if ($item->isDir()) {
                @ftp_mkdir($ftp, $remotePath);
            } else {
                @ftp_put($ftp, $remotePath, $item->getPathname(), FTP_BINARY);
                $count++;
            }
        }

        return $count;
    }

    private function uploadSftp(Deployment $d, string $localDir): void
    {
        $d->appendLog("Подключение SFTP: {$d->host}:{$d->port}");

        $connection = @ssh2_connect($d->host, $d->port);
        if (!$connection) throw new \Exception("Не удалось подключиться к SFTP");

        if (!@ssh2_auth_password($connection, $d->username, $d->decrypted_password)) {
            throw new \Exception('Ошибка авторизации SFTP');
        }

        $sftp = @ssh2_sftp($connection);
        if (!$sftp) throw new \Exception('Не удалось инициализировать SFTP');

        $d->appendLog("SFTP подключён");

        // Рекурсивная загрузка
        $uploaded = 0;
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($localDir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($items as $item) {
            $relative = str_replace($localDir, '', $item->getPathname());
            $remotePath = $d->remote_path . str_replace('\\', '/', $relative);
            $sftpPath = "ssh2.sftp://{$sftp}{$remotePath}";

            if ($item->isDir()) {
                @mkdir($sftpPath, 0755, true);
            } else {
                @mkdir(dirname($sftpPath), 0755, true);
                file_put_contents($sftpPath, file_get_contents($item->getPathname()));
                $uploaded++;
            }
        }

        $d->appendLog("Загружено файлов: {$uploaded}");
    }

    private function removeDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($items as $item) {
            $item->isDir() ? rmdir($item) : unlink($item);
        }
        rmdir($dir);
    }
}
