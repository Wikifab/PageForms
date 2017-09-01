# Configuration of Visual Editor for PageForms :

## requirement

Install the following extensions :
- VisualEditor : https://www.mediawiki.org/wiki/Extension:VisualEditor
- Flow : https://www.mediawiki.org/wiki/Extension:Flow

## Configuration

To proper work, you need to load VisualEditor and Flow extensions in your Localsetting.php. And you need to define your connection with parsoid. See VisualEditor documentation for more details. But you may not want VisualEditor to be activated on usual edit pages. To do so you can configure it in Loclsettings.php following this example :

```php
 wfLoadExtension( 'PageForm' );
 wfLoadExtension( 'VisualEditor' );
 wfLoadExtension( 'Flow' );
 
 // Disable VE by default for everybody
 $wgDefaultUserOptions['visualeditor-enable'] = 0;
 
 // Don't allow users to enable it
 $wgHiddenPrefs[] = 'visualeditor-enable';
 
 $wgVirtualRestConfig['modules']['parsoid'] = array(
 		// URL to the Parsoid instance
 		// Use port 8142 if you use the Debian package
 		'url' => 'http://localhost:8000',
 		// Parsoid "domain" (optional)
 		'domain' => 'localtest.me',
 );
```

## Usage 

To enable VE on a PageForm field, you need to add the class 'form-textarea' on the texteara input, in your page form template

for instance : 
  {{{field|Description|input type=textarea|class=form-textarea}}}