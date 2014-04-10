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

/**
 * Partial view for the inner body of the main template
 *
 * @var string $content
 * @var WebController $this
 */
?>

<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container-fluid df-navbar">
        <div class="navbar-header">
            <span class="pull-left df-logo"><a href="/"><img src="/img/df-apple-touch-icon.png"></a></span>
            <span class="pull-left df-brand"><span class="dream-orange">Dream</span>Factory</span>
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span
                    class="icon-bar"></span> <span class="icon-bar"></span>
            </button>
        </div>

        <div class="collapse navbar-collapse">

            <ul class="nav navbar-nav">
            </ul>
        </div>
    </div>
</div>

<div id="page-content" class="container-fluid container-inner">
    <?php echo $content; ?>
</div>

<div id="footer">
    <div class="container-fluid">
        <span class="pull-left dsp-footer-copyright">
            <p class="footer-text">&copy; <a target="_blank" href="https://www.dreamfactory.com">DreamFactory Software,
                    Inc.</a> 2012-<?php echo date(
                    'Y'
                ); ?>. All Rights Reserved.
            </p>
        </span> <span class="pull-right dsp-footer-version"><p class="footer-text">
                <a href="https://github.com/dreamfactorysoftware/dsp-core/"
                   target="_blank">v<?php echo DSP_VERSION; ?></a>
            </p></span>
    </div>
</div>
