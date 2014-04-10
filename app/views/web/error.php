<?php
/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2014 DreamFactory Software, Inc. <support@dreamfactory.com>
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
use Kisma\Core\Utility\HtmlMarkup;
use Kisma\Core\Utility\Option;

/**
 * @var $this    WebController
 * @var $error   array
 * @var $message string
 */

$_html = null;
$_message = Option::get($error, 'message', CHtml::encode($message));

if (isset($error) && is_array($error)) {
    $_html = '<table>';

    foreach ($error as $_key => $_value) {
        $_html .= HtmlMarkup::tag(
            'tr',
            null,
            HtmlMarkup::tag('td', null, $_key) .
            HtmlMarkup::tag('td', null, $_value)
        );
    }

    $_html .= '</table>';
}

if (empty($_html)) {
    $_html = 'None provided. Sorry...';
}

?>
<div class="container container-error">
    <h1>Well, this is embarrassing...</h1>

    <p class="lead">The server has experienced a fatal error. Our administrators will automatically be notified.
        However, if you would like to report additional information regarding this particular error, please open a case
        on our
        <a target="_blank" href="https://github.com/dreamfactorysoftware/dsp-core/issues">bug tracker</a>.
    </p>

    <h3>Error <?php echo $code; ?></h3>

    <div class="error">
        <p class="lead"><?php echo $_message; ?></p>

        <h3>Error Details</h3>

        <p><?php echo $_html; ?></p>
    </div>
</div>
<script>
    jQuery(
        function ($) {
            $('body').css('background-position', 'top center').removeClass().addClass('body-starburst-error');
        }
    );
</script>