<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('JPATH_BASE') or die('RESTRICTED');

/**
 * Renders a select element
 */
class JElementSearch extends JElement {

    /**
     * Element type
     *
     * @access	protected
     * @var		string
     */
    var $_name = 'Search';

    public function fetchElement($name, $value, &$node, $control_name) {
        jimport('joomla.plugin.helper');
        wfimport('admin.helpers.extension');

        $language = JFactory::getLanguage();

        $plugins = JPluginHelper::getPlugin('search');
        
        if (is_string($value)) {
            $value = explode(',', $value);
        }
        
        $checked = count($plugins) == count($value) ? ' checked="checked"' : '';

        $html  = '<div style="margin:2px 5px;"><input class="checkbox-list-toggle-all" type="checkbox"'. $checked .' /><label>'. WFText::_('WF_PROFILES_TOGGLE_ALL') . '</label></div>'; 
        $html .= '<ul class="checkbox-list">';

        foreach ($plugins as $plugin) {
            $plugin = WFExtensionHelper::getPlugin(null, $plugin->name, 'search');
            $language->load('plg_' . $plugin->element);

            $checked = (in_array($plugin->element, $value) || empty($value)) ? ' checked="checked"' : '';
            $html .= '<li><input type="checkbox" name="' . $control_name . '[' . $name . '][]" value="' . $plugin->element . '"' . $checked . ' /><label>' . JText::_($plugin->name) . '</label></li>';
        }

        $html .= '</ul>';

        return $html;
    }

}

?>
