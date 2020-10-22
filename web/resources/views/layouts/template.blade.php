<!DOCTYPE html>
<html>
  <head>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-35918300-7"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-35918300-7');
    </script>

    <script data-ad-client="ca-pub-2393161407259792" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

 	  <link as="style" rel="stylesheet preload prefetch" href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i&display=swap" type="text/css" crossorigin>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ isset($site_title) ? $site_title : env('SITE_NAME') }}</title>
    <meta name="author" content="Boki Toki">
    <meta name="description" content="{{ isset($site_description) ? $site_description : env('SITE_DESCRIPTION') }}">
    <meta name="keywords" content="{{ isset($site_keywords) ? $site_keywords : env('SITE_KEYWORDS') }}">

    <link rel="icon" type="image/png" href="/favicon-32x32.png?<?=time()?>" sizes="32x32" />
    <link rel="icon" type="image/png" href="/favicon-16x16.png?<?=time()?>" sizes="16x16" />

    <meta property="og:image:width" content="1190">
    <meta property="og:image:height" content="623">
    <meta property="og:description" content="{{ isset($og_description) ? $og_description : env('SITE_DESCRIPTION') }}">
    <meta property="og:title" content="{{ isset($og_title) ? $og_title : env('SITE_NAME') }}">
    <meta property="og:url" content="https://kwehbot.xyz/">
    <meta property="og:image" content="https://kwehbot.xyz/images/og_image.png">

    <link rel="stylesheet" href="{{ mix('/css/compiled/common.css') }}"/>
    <!--link rel="stylesheet" href="/css/style.css?<?=time()?>"/-->
  </head>
  <body class="bg-grey text-white">
    <div id="app" class="container" style="margin-top: 25px;">
      <header>
        <div class="mb-md-3 mb-1">
          <div class="d-md-flex d-block align-items-end justify-content-between">
            <div class="site-title">
              <a href="/">
                <h1>Kweh! FFXIV Discord Bot <i class="fab fa-discord"></i></h1>
              </a>
            </div>
            <div class="header-img d-none d-md-block">
              <div class="header-img-kweh">Kweeeeeh!</div>
              <img src="/images/kweh_header.png"/>
            </div>

            <div class="d-block d-md-none">
              <nav class="navbar navbar-expand-lg navbar-dark bg-transparent text-left">
                <button class="navbar-toggler ff-style-container mt-1 mb-1 text-left" type="button" data-toggle="collapse" data-target="#headerNav" aria-controls="headerNav" aria-expanded="false" aria-label="Toggle navigation">
                	<span class="navbar-toggler-icon mr-1"></span>
                	<span class="navbar-txt">Menu</span>
                </button>

                <div class="ff-style-container py-1 px-3 collapse navbar-collapse justify-content-md-center" id="headerNav">
                  <ul class="navbar-nav">
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'home') ? 'active' : ''  }}">
                      <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'commands') ? 'active' : ''  }}">
                      <a class="nav-link" href="/commands">Commands</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'screenshots') ? 'active' : ''  }}">
                      <a class="nav-link" href="/screenshots">Screenshots</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'support') ? 'active' : ''  }}">
                      <a class="nav-link" href="/support">Support via Patreon</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'faqs') ? 'active' : ''  }}">
                      <a class="nav-link" href="/faqs">FAQs</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'contact') ? 'active' : ''  }}">
                      <a class="nav-link" href="/contact">Contact</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'credits') ? 'active' : ''  }}">
                      <a class="nav-link" href="/credits">Credits</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'stats') ? 'active' : ''  }}">
                      <a class="nav-link" href="/stats">Stats</a>
                    </li>
                    <li class="nav-item {{ (isset($active_page) && $active_page == 'privacy') ? 'active' : ''  }}">
                      <a class="nav-link" href="/privacy">Privacy Policy</a>
                    </li>

                    @if(session()->has('auth_user_id'))
                    <li class="nav-item {{ (isset($active_page) && ($active_page == 'servers' || $active_page == 'server_settings') ) ? 'active' : ''  }}">
                      <a class="nav-link" href="/me/servers">My Servers</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="/logout">Logout</a>
                    </li>
                    @else
                    <li class="nav-item">
                      <a class="nav-link" href="/login">Login</a>
                    </li>
                    @endif

                  </ul>
                </div>
              </nav>
            </div>

          </div>
        </div>
      </header>
      <main>
        <div class="d-md-flex d-block">
          <div class="d-md-block d-none p-3 ff-style-container" style="min-height: 200px; width: 240px;">
            <div class="menu">
              <div class="menu-header">Menu</div>
              <nav>
                <ul class="side-menu">
                  <li class="{{ (isset($active_page) && $active_page == 'home') ? 'active' : ''  }}">
                    <a href="/">Home</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'commands') ? 'active' : ''  }}">
                    <a href="/commands">Commands</a>
                    @if($active_page == 'commands')
                    <ol class="sub-menu">
                      <li><a href="#register">Register</a></li>
                      <li><a href="#me">Me</a></li>
                      <li><a href="#profile">Profile</a></li>
                      <li><a href="#glam">Glamour</a></li>
                      <li><a href="#ec">Eorzea Collection</a></li>
                      <li><a href="#fflogs">FFlogs</a></li>
                      <li><a href="#marketboard">Marketboard</a></li>
                      <li><a href="#item">Item</a></li>
                      <li><a href="#ffxivcollect">FFXIV Collect</a></li>
                      <li><a href="#timers">Timers</a></li>
                      <li><a href="#maintenance">Maintenance</a></li>
                      <li><a href="#tt">Triple Triad</a></li>
                      <li><a href="#news">Lodestone News</a></li>
                      <li><a href="#fashion">Fashion Report</a></li>
                      <li><a href="#language">Language</a></li>
                      <li><a href="#default-channel">Default Channel</a></li>
                      <li><a href="#auto-delete">Auto Delete</a></li>
                      <li><a href="#prefix">Prefix</a></li>
                      <li><a href="#help">Help</a></li>
                    </ol>
                    @endif
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'screenshots') ? 'active' : ''  }}">
                    <a href="/screenshots">Screenshots</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'support') ? 'active' : ''  }}">
                    <a href="/support">Support via Patreon</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'faqs') ? 'active' : ''  }}">
                    <a href="/faqs">FAQs</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'contact') ? 'active' : ''  }}">
                    <a href="/contact">Contact</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'credits') ? 'active' : ''  }}">
                    <a href="/credits">Credits</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'stats') ? 'active' : ''  }}">
                    <a href="/stats">Stats</a>
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'privacy') ? 'active' : ''  }}">
                    <a href="/privacy">Privacy Policy</a>
                  </li>
                </ul>
              </nav>

              <div class="menu-header">Manage Servers</div>
              <nav>
                <ul class="side-menu">
                  @if(session()->has('auth_user_id'))
                  <li class="{{ (isset($active_page) && ($active_page == 'servers' || $active_page == 'server_settings') ) ? 'active' : ''  }}">
                    <a href="/me/servers">Servers</a>
                    @if( isset($servers) )
                    <ol class="sub-menu" style="list-style: circle;">
                      @foreach($servers as $s)
                        <li><a href="/me/servers/{{$s->id}}" class="{{ (isset($server_id) && $server_id == $s->id) ? '' : 'text-white'  }}">{{ $s->name }}</a></li>
                      @endforeach
                    </ol>
                    @endif
                  </li>
                  <li class="{{ (isset($active_page) && $active_page == 'profile') ? 'active' : ''  }}">
                    <a href="/me/profile">Profile</a>
                  </li>
                  <li>
                    <a href="/logout">Logout</a>
                  </li>
                  @else
                  <li>
                    <a href="/login">Login</a>
                  </li>
                  @endif
                </ul>
              </nav>
            </div>
          </div>
          <div class="p-3 ml-0 ml-md-3 ff-style-container" style="width: 100%;">
            @yield('body')
          </div>
        </div>
      </main>
    </div>
    <footer>
      <div class="container">
        <div id="footer" class="text-center mt-2 mb-2 pl-3 pr-3 text-secondary">
          <div class="mt-1 mb-3">
            <a href="https://twitter.com/kwehbot" target="_blank" class="text-secondary"><i class="fab fa-twitter fa-2x px-1"></i></a>
            <a href="{{env('PATREON_LINK')}}" target="_blank" class="text-secondary"><i class="fab fa-patreon fa-2x px-1"></i></a>
            <a href="https://discord.gg/epaBYeW" target="_blank" class="text-secondary"><i class="fab fa-discord fa-2x px-1"></i></a>
          </div>
          <div>&copy; 2020 kwehbot.xyz</div>
          <div class="text-uppercase"><small>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</small></div>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous" async></script>
        <script src="{{ mix('/js/compiled/common.js') }}"></script>
        @yield('footer')
      </div>
    </footer>
  </body>
</html>
