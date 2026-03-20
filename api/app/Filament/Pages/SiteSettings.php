<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class SiteSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationGroup = 'Настройки';
    protected static ?string $navigationLabel = 'Настройки сайта';
    protected static ?string $title = 'Настройки сайта';
    protected static ?int $navigationSort = 99;
    protected static string $view = 'filament.pages.site-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $this->form->fill($settings);
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Настройки')->tabs([
                Forms\Components\Tabs\Tab::make('Общие')->schema([
                    Forms\Components\TextInput::make('site_name')
                        ->label('Название сайта')
                        ->default('AITempl'),
                    Forms\Components\TextInput::make('site_description')
                        ->label('Описание')
                        ->default('AI-платформа для запуска сайтов'),
                    Forms\Components\TextInput::make('support_email')
                        ->label('Email поддержки')
                        ->email(),
                    Forms\Components\TextInput::make('support_telegram')
                        ->label('Telegram поддержки')
                        ->prefix('@'),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Контакты')->schema([
                    Forms\Components\TextInput::make('company_name')
                        ->label('Юр. лицо'),
                    Forms\Components\TextInput::make('company_inn')
                        ->label('ИНН'),
                    Forms\Components\TextInput::make('company_phone')
                        ->label('Телефон'),
                    Forms\Components\Textarea::make('company_address')
                        ->label('Адрес')
                        ->rows(2),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Маркетинг')->schema([
                    Forms\Components\TextInput::make('promo_banner_text')
                        ->label('Текст баннера (TopBar)')
                        ->helperText('Бегущая строка вверху сайта'),
                    Forms\Components\Toggle::make('promo_banner_enabled')
                        ->label('Показывать баннер'),
                    Forms\Components\TextInput::make('popup_discount_percent')
                        ->label('Скидка в pop-up (%)')
                        ->numeric(),
                    Forms\Components\TextInput::make('popup_promo_code')
                        ->label('Промокод в pop-up'),
                    Forms\Components\Toggle::make('popup_enabled')
                        ->label('Показывать pop-up'),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('SEO')->schema([
                    Forms\Components\TextInput::make('meta_title_suffix')
                        ->label('Суффикс Title')
                        ->default('| AITempl'),
                    Forms\Components\Textarea::make('meta_description_default')
                        ->label('Описание по умолчанию')
                        ->rows(2),
                    Forms\Components\TextInput::make('google_verification')
                        ->label('Google Verification'),
                    Forms\Components\TextInput::make('yandex_verification')
                        ->label('Yandex Verification'),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Социальные сети')->schema([
                    Forms\Components\TextInput::make('social_telegram')->label('Telegram URL'),
                    Forms\Components\TextInput::make('social_vk')->label('VK URL'),
                    Forms\Components\TextInput::make('social_youtube')->label('YouTube URL'),
                    Forms\Components\TextInput::make('social_dzen')->label('Дзен URL'),
                ])->columns(2),
            ])->columnSpanFull(),
        ])->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            if ($value !== null) {
                Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value);
            }
        }

        Notification::make()
            ->title('Настройки сохранены')
            ->success()
            ->send();
    }
}
