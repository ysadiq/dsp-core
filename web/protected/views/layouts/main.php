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

	<title>DreamFactory Services Platform&trade;</title>

	<link rel="shortcut icon" href="/img/df_logo_factory-32x32.png" />

	<!-- Standard CSS from style guide -->
	<!-- Bootstrap 3 CSS -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
	<!-- Optional theme -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap-theme.min.css">
	<!-- Font Awesome -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css">
	<!--[if IE 7]>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome-ie7.css">
	<![endif]-->
	<link rel="stylesheet" type="text/css" href="//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css" />
	<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.4/bootstrap-editable/css/bootstrap-editable.css" rel="stylesheet">
	<!-- DreamFactory Typography Css -->
	<link rel="stylesheet" href="/css/df-custom-bs.css">
	<link rel="stylesheet" href="/css/forms.css">
	<!--	<link rel="stylesheet" type="text/css" href="/css/main.css" />-->
	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="/js/html5shiv.js"></script>
	<script src="/js/respond.min.js"></script>
	<![endif]-->
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
<div id="wrap">
	<?php echo $content; ?>
</div>
<div id="push"></div>
<div id="footer">
	<div class="container align-center">
		<p class="footer-text">&copy; <a href="http://dreamfactory.com">DreamFactory Software, Inc.</a> <?php echo date( 'Y' ); ?>. All Rights Reserved.</p>
	</div>
</div>

<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.js"></script>
<script src="//ajax.aspnetcdn.com/ajax/jquery.validate/1.10.0/jquery.validate.min.js"></script>
<script src="//ajax.aspnetcdn.com/ajax/jquery.validate/1.10.0/additional-methods.min.js"></script>
</body>
</html>
