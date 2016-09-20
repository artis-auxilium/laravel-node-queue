<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Config\Repository;

class NodeConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'node:config {config=all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'display config for laravel-queue';

    private $config;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(Repository $config)
    {
        parent::__construct();
        $this->config = $config;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $argument = $this->argument();
        if (isset($argument['config']) && $argument['config'] != 'all') {
            $this->line(json_encode($this->config->get($argument['config'], [])));
            return;
        }
        $this->line(json_encode(array_keys($this->config->all())));        
    }
}
