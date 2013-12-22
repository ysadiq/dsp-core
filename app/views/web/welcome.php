<?php
/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2013 DreamFactory Software, Inc. <developer-support@dreamfactory.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
use DreamFactory\Yii\Utility\Validate;

/**
 * @var $this  WebController
 */

Validate::register(
	'form#register-form',
	array(
		'ignoreTitle'    => true,
		'errorClass'     => 'error',
		'errorPlacement' => 'function(error,element){error.appendTo(element.closest(".form-group"));error.css({"color":"#CFB0B0","margin":"-10px 0 0"});}',
	)
);

?>
<div class="container" id="formbox">
	<h2 class="lead">Welcome!</h2>

	<p>Please register for free DreamFactory support and important product information. We will never share your email with anyone and you can unsubscribe at any time.</p>

	<form class="form form-horizontal" id="register-form" method="POST">
		<input type="hidden" name="SupportForm[skipped]" id="SupportForm_skipped" value="0">

		<div class="form-group">
			<label for="SupportForm_emailAddress" class="sr-only">Email Address</label>
				<input tabindex="1" class="form-control email" autofocus type="email" id="SupportForm_emailAddress" name="SupportForm[emailAddress]"
		</div>

		<div class="form-buttons">
			<button type="submit" class="btn btn-success pull-right">Register</button>
			<button type="button" id="btn-skip" class="btn btn-default pull-left">Skip</button>
		</div>
	</form>
</div>
<script type="text/javascript">
jQuery(function($) {
	var $_form = $('#register-form');

	$('#btn-skip').on('click', function(e) {
		e.preventDefault();
		$('#SupportForm_emailAddress').val('');
		$('#SupportForm_skipped').val(1);
		$_form.submit();
	});
});
</script>
