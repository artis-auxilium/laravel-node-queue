[![Codacy Badge](https://api.codacy.com/project/badge/Grade/83770719db9d4480a1f2162c3399c325)](https://www.codacy.com/app/icfr/laravel-node-queue_2?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=artis-auxilium/laravel-node-queue&amp;utm_campaign=Badge_Grade)

# node server for Laravel queue

[![NPM](https://nodei.co/npm/laravel-queue.png)](https://nodei.co/npm/laravel-queue/)

Process job on laravel events

## Getting started

### Install and init module

Create package.json

```
npm init
```

Install laravel-queue

```
npm install --save laravel-queue
```

After init the apllication

```
./artisan init
```

It ask for laravel project path then ask for command path
(relative to laravel project path)
then when asked add this to Console/kernel.php
> if your commands folder is not standart(e.g app/Console/Commands),
dont forget to change namespace of the class

```php
    \App\Console\Commands\NodeConfig::class
```

Import laravel config

```
./artisan laravel:config
```

It ask which config to import and show you setting to put
to config in Config/laravel.js to automatically import with the same setting

If you need to interact with database (only tested with mysql)
you can import model from database
add model to import in Config/core.js and run

```
./artisan make:models
```

#### Example laravel event

```php
<?php

namespace App\Events;

use App\Events\Event;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class EventExample extends Event implements ShouldBroadcastNow
{
    use SerializesModels;
    //public variable send with event
    public $data;
    public $otherData;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($dataToSend)
    {
        $this->data = $dataToSend;
        $this->otherData = 'otherData';
    }

    /**
     * Get the broadcast event name.
     * event name in javascript object notation
     * @return string
     *
     */
    public function broadcastAs()
    {
        return 'app.example';
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn()
    {
        return [config('broadcasting.channel', 'laravel-channel')];
    }
}
```

In Config/app.js add this in job

```javascript
app: {
    example: "exampleJob"
}
```

then run this for create job

```
./artisan make:job
```

look at Jobs folder to test job, data is stored in job.data.

Complete documentation will come soon...

#### why use it

php artisan queue:listen use pooling and use cpu to check if job need to run

node is event-driven and do job when arrive so it use less cpu

#### to-do

- [x] write test
- [ ] write doc
- [ ] import from other databases (postgresql,sqlite,...)

### Stuff used to make this

#### Package

- [sequelize]: database orm
- [bee-queue]: job processing
- [ect]: email template

#### package forked and included

- [shell] for artisan cli
- [sequelize-db-export-import] for creating sequelize model from mysql database
 (only javascript, coffee removed)

[sequelize]:http://docs.sequelizejs.com/en/v3/
[bee-queue]:https://github.com/LewisJEllis/bee-queue
[ect]:http://softwaremaniacs.org/soft/highlight/en/
[shell]:https://github.com/wdavidw/node-shell
[sequelize-db-export-import]:https://github.com/boiawang/sequelize-db-export-import
