<?php
/**
 * @var string        $content
 * @var WebController $this
 */
$_versions = array(
    'bootstrap'       => '3.1.1',
    'font-awesome'    => '4.0.3',
    'bootswatch'      => '3.1.1',
    'jquery'          => '2.1.0',
    'jquery.validate' => '1.11.1',
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>DreamFactory Services Platform&trade;</title>

    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="author" content="DreamFactory Software, Inc.">
    <meta name="language" content="en" />
    <link rel="shortcut icon" href="/img/df_logo_factory-32x32.png" />

    <!-- Bootstrap 3 CSS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/<?php echo $_versions['bootstrap']; ?>/css/bootstrap.min.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/<?php echo $_versions['font-awesome']; ?>/css/font-awesome.min.css">

    <!-- DreamFactory Typography Css -->
    <link rel="stylesheet" href="/css/df-custom-bs.css">

    <!-- DSP UI Styles & Code -->
    <link rel="stylesheet" href="/css/dsp.main.css">
    <link rel="stylesheet" href="/css/dsp.ui.css">
    <link rel="stylesheet" href="/css/login.css">
    <link rel="stylesheet" href="/css/remote-login.css">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries --><!--[if lt IE 9]>
    <script src="//cdn.jsdelivr.net/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="//cdn.jsdelivr.net/respond/1.4.2/respond.min.js"></script><![endif]-->

    <script src="//ajax.googleapis.com/ajax/libs/jquery/<?php echo $_versions['jquery']; ?>/jquery.min.js"></script>
    <script src="/js/dsp.ui.js" defer="defer"></script>
</head>
<body class="body-starburst">

<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container-fluid">
        <div class="navbar-header">
            <div class="navbar-left df-logo"><a href="/"><img src="/img/df-apple-touch-icon.png"></a></div>
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span>
            </button>
        </div>
    </div>
</div>

<div class="container-fluid container-inner">
    <?php echo $content; ?>
</div>

<div id="footer">
    <div class="container align-center">
        <p class="footer-text">&copy; <a href="http://www.dreamfactory.com">DreamFactory Software, Inc.</a>
            <?php echo date( 'Y' ); ?>. All Rights Reserved.
        </p>
    </div>
</div>

<script src="//netdna.bootstrapcdn.com/bootstrap/<?php echo $_versions['bootstrap']; ?>/js/bootstrap.min.js"></script>
</body>
</html>
