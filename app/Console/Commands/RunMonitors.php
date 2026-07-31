<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Monitor;
use App\Models\Scan;
use App\Services\UrlScanningService;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RunMonitors extends Command
{
    protected $signature = 'monitor:run';
    protected $description = 'Run automated security scans';

    public function handle()
    {
        $monitors = Monitor::where('status', 'active')->get();
        $scanner = new UrlScanningService();

        foreach ($monitors as $monitor) {
            $shouldRun = false;
            
            // Logic: Check if scan is due
            if (!$monitor->last_scan_at) {
                $shouldRun = true;
            } else {
                $last = Carbon::parse($monitor->last_scan_at);
                if ($monitor->frequency === 'daily' && $last->diffInHours(now()) >= 24) $shouldRun = true;
                if ($monitor->frequency === 'weekly' && $last->diffInDays(now()) >= 7) $shouldRun = true;
            }

            if ($shouldRun) {
                $this->info("Scanning: " . $monitor->name);
                
                $results = $scanner->runScan($monitor->target);
                $reference = 'AUTO_' . Str::upper(Str::random(10));

                Scan::create([
                    'scan_reference' => $reference,
                    'target_type' => $monitor->type,
                    'target_value' => $monitor->target,
                    'selected_options' => ['auto'],
                    'status' => 'completed',
                    'score' => $results['score'],
                    'results' => $results['issues']
                ]);

                $monitor->update(['last_scan_at' => now()]);
            }
        }
        $this->info('All monitors checked.');
    }
}