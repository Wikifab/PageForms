<?php
/**
 * @author Yaron Koren
 * @file
 * @ingroup PF
 */

/**
 * Represents the "free text" in a wiki page, i.e. the text not in
 * pre-defined template calls and sections.
 */
class PFWikiPageFreeText {
	private $mText;
	private $mOptions;

	function __construct( $options = [] ) {
		$this->mOptions = $options;
	}

	function setText( &$text, $form_submitted = FALSE ) {

		if ( $this->isTranslateEnabled() && isset($this->mOptions['translatable']) && $this->mOptions['translatable']) {

			if (!$form_submitted) {
				// remove translate tags when displaying the form as it messes up with VE
				if(preg_match('#^<translate>([\S\s]*)<\/translate>$#m', $text, $matches)) {
					$text = $matches[1];
				}
			} else {
				// put them back
				$text = '<translate>' . $text .'</translate>';
			}
		}

		$this->mText = $text;
	}

	function isTranslateEnabled() {
		return class_exists('SpecialTranslate');
	}

	function getText() {
		return $this->mText;
	}

	function getOptions() {
		return $this->mOptions;
	}

	function setOptions( $options ) {
		$this->mOptions = $options;
	}
}