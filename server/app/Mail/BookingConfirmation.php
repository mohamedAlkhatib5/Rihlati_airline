<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The confirmation sent once a booking is paid.
 *
 * In local development `MAIL_MAILER=log` writes it to storage/logs, so the
 * flow can be exercised end to end without an SMTP account.
 */
class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [$this->booking->contact_email],
            subject: "Your Rihlati booking {$this->booking->pnr} is confirmed",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.booking-confirmation',
            with: [
                'booking' => $this->booking->loadMissing([
                    'segments.flight.origin',
                    'segments.flight.destination',
                    'passengers',
                ]),
            ],
        );
    }
}
