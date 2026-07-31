<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upgrade_subscription()
    {
        $user = User::factory()->create([
            'plan_type' => 'free',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/subscription/upgrade', [
                'plan_name' => 'gold',
                'amount' => 1100,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Subscription upgraded successfully to Gold',
            ]);

        $user->refresh();
        $this->assertEquals('gold', $user->plan_type);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'plan_name' => 'gold',
            'amount' => 1100.00,
        ]);
    }

    public function test_user_can_retrieve_subscription_history()
    {
        $user = User::factory()->create();

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'invoice_id' => 'INV-TEST1234',
            'plan_name' => 'gold',
            'amount' => 1100,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/subscription/history');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    [
                        'invoice_id' => 'INV-TEST1234',
                        'plan_name' => 'gold',
                        'amount' => '1100.00',
                    ]
                ]
            ]);
    }
}
