<?php
/**
 * @var string        $content
 * @var WebController $this
 */
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
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css">

    <!-- DreamFactory Typography Css -->
    <link rel="stylesheet" href="/css/df-custom-bs.css">
    <link rel="stylesheet" href="/css/forms.css">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->    <!--[if lt IE 9]>
    <script src="/js/html5shiv.js"></script>
    <script src="/js/respond.min.js"></script>    <![endif]-->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>

    <!-- DSP UI Styles & Code -->
    <link rel="stylesheet" href="/css/dsp.ui.css">
    <script src="/js/dsp.ui.js" defer="defer"></script>
    <style>
        #wrap {
            padding-bottom: 60px;
        }
    </style>
</head>
<body class="body-dark">
<div id="navbar-container">
    <div class="navbar navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-spacer">
                <div class="navbar-left df-logo"><a href="/"><img src="/img/logo.png"></a></div>
            </div>

            <div class="navbar-spacer">
                <div class="navbar-right">
                    <span class="is-awesome">Totes Awesome!</span>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="wrap">
    <?php echo $content; ?>

    <div id="push"></div>
</div>

<div id="footer">
    <div class="container align-center">
        <p class="footer-text">&copy; <a href="http://www.dreamfactory.com">DreamFactory Software, Inc.</a>
            <?php echo date( 'Y' ); ?>. All Rights Reserved.
        </p>
    </div>
</div>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
<script src="//ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js"></script>
<script src="//ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/additional-methods.min.js"></script>
</body>
</html>
