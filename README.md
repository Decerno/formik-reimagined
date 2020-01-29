# Formik reimagined

Formik inspired API

## Why

We have used Formik to render a huge form with hundreds of fields in many subcomponents. The performance impact of Formik validation and submit caused degraded user experience.

In order to get around these issues we decided to make a Formik fork compatible with the parts of the Formik API that is relevant in the application.

## Lessons learned

Some of the lessons learned from this fork can be moved over to Formik with some minor breaking changes to the procedural API.
