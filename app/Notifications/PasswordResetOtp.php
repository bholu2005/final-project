<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PasswordResetOtp extends Notification
{
    use Queueable;

    public function __construct(private readonly string $otp) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Merlin password reset code')
            ->line('Use this verification code to reset your password:')
            ->line($this->otp)
            ->line('This code expires in 10 minutes. Never share it with anyone.');
    }
}
