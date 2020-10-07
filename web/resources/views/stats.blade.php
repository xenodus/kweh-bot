@extends('layouts.template')

@section('footer')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.css" integrity="sha256-aa0xaJgmK/X74WM224KMQeNQC2xYKwlAt08oZqjeF0E=" crossorigin="anonymous" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js" integrity="sha256-Uv9BNBucvCPipKQ2NS9wYpJmi8DTOEfTA/nH2aoJALw=" crossorigin="anonymous"></script>
<script>
$(document).ready(function(){
  $.get('/api/stats', function(data){

    $("#servers").html("Servers: " + data.server_count.toLocaleString());
    $("#users").html("Registered Users: " + data.user_count.toLocaleString());
    $("#commandsIssued").html("Commands Processed: " + data.commands_sum.toLocaleString());
    $('div.spinner').removeClass('spinner').addClass('w-100');

    var color = Chart.helpers.color;

    // SERVER PREFIX

    var prefixes = data.prefix_breakdown.map(function(p){ return p.prefix });
    var prefixes_count = data.prefix_breakdown.map(function(p){ return p.no });

    var colors = [];
    for(var i=0; i<prefixes.length; i++) {
      colors.push( randomColor() );
    }

    var serverPrefixCanvas = document.getElementById('prefixes').getContext('2d');
    var serverPrefixChart = new Chart(serverPrefixCanvas, {
      type: 'horizontalBar',
      data: {
        datasets: [{
          data: prefixes_count,
          backgroundColor: colors,
        }],
        labels: prefixes
      },
      options: {
        title: {
          display: true,
          text: 'Prefixes',
          fontColor: '#FFF'
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            ticks: {
              min: 0,
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }]
        },
        layout: {
          padding: {
            left: 10,
            right: 30,
            top: 0,
            bottom: 15
          }
        }
      }
    });

    // COMMANDS

    var commands = [
      data.register_command_count,
      data.me_command_count,
      data.profile_command_count,
      data.glam_command_count,
      data.ec_command_count,
      data.fflogs_command_count,
      data.mb_command_count,
      data.item_command_count,
      data.mount_command_count,
      data.minion_command_count,
      data.title_command_count,
      data.emote_command_count,
      data.barding_command_count,
      data.timers_command_count,
      data.maint_command_count,
      data.tt_command_count,
      data.donate_command_count,
      data.help_command_count
    ];

    var colors = [];
    for(var i=0; i<commands.length; i++) {
      colors.push( randomColor() );
    }

    var commandsIssuedCanvas = document.getElementById('commands').getContext('2d');
    var commandsIssuedChart = new Chart(commandsIssuedCanvas, {
      type: 'bar',
      data: {
        datasets: [{
          data: commands,
          backgroundColor: colors,
        }],
        labels: [
          'register', 'me', 'profile', 'glam', 'ec', 'logs', 'mb',
          'item', 'mount', 'minion', 'title', 'emote', 'barding',
          'timers', 'maint', 'tt', 'donate', 'help'
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Game Related Commands Processed',
          fontColor: '#FFF'
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 10,
            right: 30,
            top: 0,
            bottom: 15
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              fontColor: "#FFF",
            },
            gridLines: {
              color: "#777"
            }
          }],
        },
      }
    });

    // SERVER SETTINGS COMMANDS

    var ssCommands = [
      data.news_command_count,
      data.fr_command_count,
      data.language_command_count,
      data.channel_command_count,
      data.autodelete_command_count,
      data.prefix_command_count
    ];

    var colors = [];
    for(var i=0; i<commands.length; i++) {
      colors.push( randomColor() );
    }

    var ssCommandsIssuedCanvas = document.getElementById('server-settings-commands').getContext('2d');
    var ssCommandsIssuedChart = new Chart(ssCommandsIssuedCanvas, {
      type: 'bar',
      data: {
        datasets: [{
          data: ssCommands,
          backgroundColor: colors,
        }],
        labels: ['news', 'fashion', 'language', 'channel', 'autodelete', 'prefix']
      },
      options: {
        title: {
          display: true,
          text: 'Server Setting Commands Processed',
          fontColor: '#FFF'
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 10,
            right: 30,
            top: 0,
            bottom: 15
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
        },
      }
    });

    // Servers by date
    var serverAddedDates = data.servers_by_date.map(function(p){ return moment(p.month_year, "MM-YYYY").format("MMM YYYY") });
    var serverAddedNo = data.servers_by_date.map(function(p){ return p.no });

    var serversAddedCanvas = document.getElementById('servers_added_date').getContext('2d');

    var serversAddedChart = new Chart(serversAddedCanvas, {
      type: 'bar',
      data: {
        datasets: [
          {
            data: serverAddedNo,
            backgroundColor: "#ff6384",
            lineTension: 0
          },
        ],
        labels: serverAddedDates,
      },
      options: {
        title: {
          display: true,
          text: 'Servers Joined',
          fontColor: '#FFF'
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 10,
            right: 30,
            top: 0,
            bottom: 15
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: "#FFF"
            },
            gridLines: {
              color: "#777"
            }
          }],
        },
      }
    });

  });
});

function randomColor(){

  function randomIntFromInterval(min,max) // min and max included
  {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  // brightness = randomIntFromInterval(1, 100);
  brightness = 75;

  function randomChannel(brightness){
    var r = 255-brightness;
    var n = 0|((Math.random() * r) + brightness);
    var s = n.toString(16);
    return (s.length==1) ? '0'+s : s;
  }
  return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
}
</script>
@endsection

@section('body')
<h1 class="page-header mb-4">
  Stats
</h1>

<div class="row">
  <div class="mb-3 col-12">
    <div id="servers"></div>
    <div id="users"></div>
    <div id="commandsIssued"></div>
  </div>

  <div class="spinner">

    <div class="mb-3 col-12 text-center">
      <canvas id="commands"></canvas>
    </div>

    <div class="mb-3 col-12 text-center">
      <canvas id="server-settings-commands"></canvas>
    </div>

    <div class="mb-3 col-12 text-center">
      <canvas id="prefixes"></canvas>
    </div>

    <div class="mb-3 col-12 text-center">
      <canvas id="servers_added_date"></canvas>
    </div>

  </div>

</div>

@endsection
