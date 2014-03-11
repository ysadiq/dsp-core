<?php
/**
 * @var string        $content
 * @var WebController $this
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1.0">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="author" content="DreamFactory Software, Inc.">
	<meta name="language" content="en" />
	<title>We are terribly sorry...</title>
	<link rel="shortcut icon" href="/img/df_logo_factory-32x32.png" />
	<!-- Standard CSS from style guide -->	<!-- Bootstrap 3 CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">
	<!-- Font Awesome -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css">
	<!-- DreamFactory Typography Css -->
	<link rel="stylesheet" href="/css/df-custom-bs.css">
	<link rel="stylesheet" href="/css/forms.css">
	<link rel="stylesheet" href="/css/maintenance.css">
	<!--[if lt IE 9]>
	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<script src="/js/html5shiv.js"></script>
	<script src="/js/respond.min.js"></script>
	<![endif]-->
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
</head>
<body class="maintenance-page">
	<div id="wrap">
		<div class="page-logo"><img src="/images/df-apple-touch-icon.png" alt=""></div>
		<?php echo $content; ?>
	</div>
	<div id="push"></div>
	<div id="footer">
		<div class="container align-center">
			<p class="footer-text">&copy; <a href="http://dreamfactory.com">DreamFactory Software, Inc.</a> <?php echo date(
					'Y'
				); ?>. All Rights Reserved.<span class="footer-logo pull-right"><img src="/images/df-apple-touch-icon.png" alt=""></span></p>
		</div>
	</div>
</body>
</html>
