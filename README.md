# Formik reimagined

Formik inspired API

## Why

We have used Formik to render a huge form with hundreds of fields in many subcomponents. The performance impact of Formik validation and submit caused degraded user experience.

In order to get around these issues we decided to make a Formik fork compatible with the parts of the Formik API that is relevant in the application.

## Current subset of Formik

- `FieldArray ( arrayHelper )` : note that the return values are removed, instead the helper methods send events to the internal reducer
- `withFormik` -> `withFormikReimagined`
- `Formik` -> `FormikReimagined` : note that the initial values and default functions differ from regular Formik
- The error API is slightly different in order to be able to use a Map (to get better performance)

We have implemented the subset of [Formik 2.1.1](https://github.com/formium/formik/releases/tag/v2.1.1) that we used in the application.

The following are NOT implemented in this library:

- `Field` & `FastField` : are not implemented but you could implement something similar with a slightly different API

## Lessons learned

Some of the lessons learned from this fork can be moved over to Formik with some minor breaking changes to the procedural API.
