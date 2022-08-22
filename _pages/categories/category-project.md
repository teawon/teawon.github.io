---
title: "PROJECT"
layout: archive
permalink: categories/project
author_profile: true
sidebar_main: true
---

{% assign posts = site.categories.Project %}
{% for post in posts %} {% include archive-category.html type=page.entries_layout %} {% endfor %}
