<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AiAssistantTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated requests are blocked.
     */
    public function test_unauthenticated_requests_are_blocked()
    {
        $response = $this->postJson('/api/ai/chat', [
            'message' => 'Help me secure my SQL database structure.'
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test authenticated request simulation fallback when key is not configured.
     */
    public function test_authenticated_request_provides_simulation_fallback()
    {
        $user = User::factory()->create([
            'role' => 'user',
            'plan_type' => 'free'
        ]);

        $response = $this->actingAs($user)->postJson('/api/ai/chat', [
            'message' => 'How do I remediate a potential SQL Injection exploit?'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'reply',
            'provider'
        ]);

        $this->assertEquals('simulation', $response->json('provider'));
        $this->assertStringContainsString('SQL Injection', $response->json('reply'));
    }
}
