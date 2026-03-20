<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @foreach($this->getChecks() as $check)
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div class="flex-shrink-0">
                    @if($check['status'])
                        <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <x-heroicon-o-check-circle class="w-6 h-6 text-emerald-500" />
                        </div>
                    @else
                        <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <x-heroicon-o-x-circle class="w-6 h-6 text-rose-500" />
                        </div>
                    @endif
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm text-gray-950 dark:text-white">{{ $check['name'] }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ $check['detail'] }}</div>
                </div>
            </div>
        @endforeach
    </div>

    <div class="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-sm mb-2 text-gray-950 dark:text-white">Информация</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div><span class="font-medium">PHP:</span> {{ phpversion() }}</div>
            <div><span class="font-medium">Laravel:</span> {{ app()->version() }}</div>
            <div><span class="font-medium">Filament:</span> {{ \Composer\InstalledVersions::getVersion('filament/filament') ?? '?' }}</div>
            <div><span class="font-medium">Окружение:</span> {{ config('app.env') }}</div>
        </div>
    </div>
</x-filament-panels::page>
