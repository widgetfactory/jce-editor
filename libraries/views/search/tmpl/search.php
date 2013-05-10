<?php
/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');
?>
<div id="search-browser">
    <div class="input-append span12">
        <input type="text" id="search-input" class="span10" placeholder="<?php echo WFText::_('WF_LABEL_SEARCH'); ?>..." /><span class="search-icon"></span>
        <div class="btn-group">
            <button class="button btn" id="search-button" role="button"><?php echo WFText::_('WF_LABEL_SEARCH'); ?></button>
            <button class="btn dropdown-toggle" data-toggle="dropdown" id="search-options-button">
                <span class="caret"></span>
            </button>
        </div>
    </div>
    <div id="search-options" class="dropdown-menu">
        <h3><?php echo JText::_('WF_SEARCH_FOR'); ?></h3>
        <div class="phrases-box">
            <?php echo $this->lists['searchphrase']; ?>
        </div>
        <div class="ordering-box">
            <label for="ordering" class="ordering span3">
                <?php echo JText::_('WF_SEARCH_ORDERING'); ?>
            </label>
            <?php echo $this->lists['ordering']; ?>
        </div>
        <h3><?php echo JText::_('WF_SEARCH_SEARCH_ONLY'); ?></h3>
        <ul>
            <?php
            foreach ($this->searchareas as $val => $txt) :
                ?>
                <li>
                    <input type="checkbox" name="areas[]" value="<?php echo $val; ?>" id="area-<?php echo $val; ?>" />
                    <label for="area-<?php echo $val; ?>">
                        <?php echo JText::_($txt); ?>
                    </label>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <div id="search-result" class="dropdown-menu span12"></div>
</div>