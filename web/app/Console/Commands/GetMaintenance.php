<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Client;
use Carbon\Carbon;

class GetMaintenance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'get:maint';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrap Lodestone for Maintenance schdules';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('------ Check for Maintenance Started @ ' . date('Y-m-d H:i:s') . ' ------');

        $client = new Client(); //GuzzleHttp\Client
        $lodestonenews_response = $client->get("http://na.lodestonenews.com/news/maintenance");
        $maints_added = 0;

        if( $lodestonenews_response->getStatusCode() == 200 ) {
            $maintenance = json_decode($lodestonenews_response->getBody()->getContents());
            $maintenance = collect($maintenance);

            if( count($maintenance) ) {

                foreach($maintenance as $maint) {
                    $is_maint = preg_match('/All Worlds Maintenance \(.*\)$/', $maint->title);

                    if( $is_maint ) {

                        $maint_event = App\Models\Event::where('lodestone_id', $maint->id)->first();

                        if( !$maint_event ) {
                            $maint_event = new App\Models\Event();
                            $maint_event->lodestone_id = $maint->id;
                            $maint_event->name = $maint->title;
                            $maint_event->date_start = Carbon::parse($maint->start)->setTimezone('Asia/Singapore')->format('Y-m-d H:i:s');
                            $maint_event->date_end = Carbon::parse($maint->end)->setTimezone('Asia/Singapore')->format('Y-m-d H:i:s');
                            $maint_event->url = $maint->url;
                            $maint_event->type = 'maintenance';
                            $maint_event->date_added = date('Y-m-d H:i:s');

                            $maint_event->save();
                            $maints_added++;

                            $this->info('New Maintenance: ' . $maint_event->name);
                        }
                    }
                }
            }
        }

        $this->info('Maintenance Added: ' . $maints_added);

        $this->info('------ Check for Maintenance Ended @ ' . date('Y-m-d H:i:s') . ' ------');

        return 1;
    }
}
