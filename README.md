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

- `commentbars.defaultFillChar` &mdash;
- `quickPresets` &mdash;
- `commentDelimsUser` 
   (see [Delimeter Configuration](#comment-delimeters-configuration)) 
   &mdash; The set of comment delimeters that is meant to be
   overridden by the user. The default value is empty. 
- `commentDelimsFallback`
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
