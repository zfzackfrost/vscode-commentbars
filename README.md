# Comment Bars

## What's a Comment Bar anyway?

**Comment Bars**, in the context of this extension, are comments in your
code that help to separate your work into logical sections. Here are some 
Comment Bars using C-style comments:

Plain separator, no text:
```c
/* ====================================================== */
/* ====================================================== */
/* ====================================================== */
```

Same as above, with added text:
```c
/* ====================================================== */
/* ================== Comment Bars Rock ================= */
/* ====================================================== */
```

Want to customize width, dash (fill) character or thickness? No problem!
```c
/* -------- Thinner ------- */
```

The Comment Bars extension automatically generates these separators.

### Seamless Filling

When seamless filling is enabled, the Comment Bars extension will attempt to
remove spaces between the comment delimeters and the fill characters. This ONLY
happens if the bordering character of the delimeters is the same character as
the fill character. Lets look at some examples.



## Additional Terminology

In order to use this extension there are a few terms that you should 
be aware of. 

- *fill character* &mdash; A single character of text that 
   is repeated across the entire width of the comment bar.
- *comment delimter* &mdash; The string of code that a programming
   language looks for to indicate the beginning or end of a comment.

## Comment Bars Commands

## Comment Bars Settings

This extension is highly configurable. The following lists the 
available settings for customizing the plugin:

- `commentbars.defaultFillChar` 
  (see [Additional Terminology](#additional-terminology))
  &mdash; The default *fill character*. At the moment this is currently
   only used by the *Advanced* mode since `quickPresets` requires a fill
   character to be specified. Must be a string with a length of 1.

- `commentbars.quickPresets` &mdash; The available preset styles for *Quick* mode.
   Must be an array of objects. Each object accepts the following keys:
    - `label` &mdash; The name of the preset to display in the selection menu

	- `fillChar` &mdash; The fill character to use when this preset style 
	   is selected

	- `width` &mdash; The width of comment bars created using this preset style
	
	- `thickness` &mdash; The number of lines tall the comment bar will be, when 
	   using this preset style. This value will be rounded up to the nearest odd
	   number in order to keep the text centered vertically.
	
	- `seamlessFill` (see [Seamless Filling](#seamless-filling)) &mdash; 
	   *Optional*, Enable seamless filling? Must be a `bool` (Default: `false`)

- `commentbars.commentDelimsUser` 
   (see [Delimeter Configuration](#comment-delimeters-configuration)) 
   &mdash; The set of comment delimeters that is meant to be
   overridden by the user. The default value is empty. 

- `commentbars.commentDelimsFallback`
  (see [Delimeter Configuration](#comment-delimeters-configuration)) 
  &mdash; The default set of comment delimeters. This should
  usually be left at the default. The intended use of this setting is to only override
  the default if there is an error in the default settings (As much as I would like to,
  I don't know every programming lanuguage VSCode supports!). **For customizations and 
  additions, use `commentDelimsUser` instead**.
 
### Comment Delimeters Configuration

## Known Issues
*If you spot any bugs, __please__ open a new issue at this extension's 
GitHub repository!*

The following is a list of all major issues with the *Comment Bars*
extension:
- There are no known issues at this time

## Release Notes

### 0.0.1
First preview release



----------------------------------------------------------------------------

**Happy Coding!**
