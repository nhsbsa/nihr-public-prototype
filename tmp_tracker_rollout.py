def replace_once(path, old, new):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    count = content.count(old)
    assert count == 1, f"{path}: expected exactly 1 occurrence, found {count}"
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK: {path}")


base = "app/views/dashboard/v2/"
INCLUDE = '{% include "dashboard/v2/includes/_profile-tracker.html" %}'

standalone_old_tail = '''    {% call card({ classes: "nhsuk-card--grey nhsuk-u-margin-top-6" }) %}
      <h3 class="nhsuk-heading-xs nhsuk-u-margin-bottom-2">Profile completeness:</h3>
      <progress value="40" max="100" class="app-progress">40%</progress>
      <p class="nhsuk-body-s nhsuk-u-margin-top-1 nhsuk-u-margin-bottom-0"><strong>40% complete</strong></p>
    {% endcall %}
  </div>'''

standalone_new_tail = f'''    <div class="nhsuk-u-margin-top-6">
      {INCLUDE}
    </div>
  </div>'''

replace_once(base + "archive.html", standalone_old_tail, standalone_new_tail)
replace_once(base + "proxy.html", standalone_old_tail, standalone_new_tail)

nested_old = '''      <h3 class="nhsuk-heading-xs nhsuk-u-margin-bottom-2">Profile completeness:</h3>
      <progress value="40" max="100" class="app-progress">40%</progress>
      <p class="nhsuk-body-s nhsuk-u-margin-top-1 nhsuk-u-margin-bottom-0"><strong>40% complete</strong></p>
    {% endcall %}
  </div>'''

nested_new = f'''    {{% endcall %}}

    <div class="nhsuk-u-margin-top-6">
      {INCLUDE}
    </div>
  </div>'''

replace_once(base + "handshake.html", nested_old, nested_new)


profile_old = '''      <h3 class="nhsuk-heading-xs nhsuk-u-margin-bottom-2">Proxy access</h3>
      <form action="switch-profile" method="post" novalidate>
        {{ radios({
          classes: "nhsuk-radios--small",
          name: "activeProfile",
          formGroup: { classes: "nhsuk-u-margin-bottom-2" },
          items: [
            { value: "self", text: "John Jones (Self)", id: "profile-self", checked: true },
            { value: "proxy", text: "Jane Jones (Dependent)", id: "profile-proxy" }
          ]
        }) }}
        {{ button({ text: "Switch profile", id: "switch-profile", classes: "nhsuk-button--secondary nhsuk-button--small nhsuk-u-margin-bottom-0" }) }}
      </form>
    {% endcall %}

  </div>'''

profile_new = f'''      <h3 class="nhsuk-heading-xs nhsuk-u-margin-bottom-2">Proxy access</h3>
      <form action="switch-profile" method="post" novalidate>
        {{{{ radios({{
          classes: "nhsuk-radios--small",
          name: "activeProfile",
          formGroup: {{ classes: "nhsuk-u-margin-bottom-2" }},
          items: [
            {{ value: "self", text: "John Jones (Self)", id: "profile-self", checked: true }},
            {{ value: "proxy", text: "Jane Jones (Dependent)", id: "profile-proxy" }}
          ]
        }}) }}}}
        {{{{ button({{ text: "Switch profile", id: "switch-profile", classes: "nhsuk-button--secondary nhsuk-button--small nhsuk-u-margin-bottom-0" }}) }}}}
      </form>
    {{% endcall %}}

    <div class="nhsuk-u-margin-top-6">
      {INCLUDE}
    </div>

  </div>'''

replace_once(base + "profile.html", profile_old, profile_new)


details_old = '''    <h3 class="nhsuk-heading-s nhsuk-u-margin-top-6">Compare profile status options</h3>
    <p class="nhsuk-body-s">Three GDS-compliant alternatives to the old profile completeness tracker, for comparison.</p>

    <p class="nhsuk-body-s nhsuk-u-margin-bottom-2"><strong>Option 1: Task list</strong></p>
    {{ taskList({
      idPrefix: "profile-sections",
      items: [
        {
          title: { text: "Personal details" },
          href: "profile",
          hint: { text: "Your name, date of birth and contact details" },
          status: { text: "Completed", classes: "nhsuk-task-list__status--completed" }
        },
        {
          title: { text: "Diagnosed conditions" },
          href: "profile",
          hint: { text: "The conditions we use to match you with relevant studies" },
          status: { text: "Completed", classes: "nhsuk-task-list__status--completed" }
        },
        {
          title: { text: "Location and travel" },
          href: "profile",
          hint: { text: "Helps us find studies running near you" },
          status: { tag: { text: "Incomplete", colour: "blue" } }
        },
        {
          title: { text: "Areas of interest" },
          href: "profile",
          hint: { text: "The types of research you would like to hear about" },
          status: { tag: { text: "Incomplete", colour: "blue" } }
        }
      ]
    }) }}

    <p class="nhsuk-body-s nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-2"><strong>Option 2: Action card</strong></p>
    {% call card({ feature: true }) %}
      {{ tag({ text: "Action required", classes: "nhsuk-tag--yellow nhsuk-u-margin-bottom-3" }) }}
      <h2 class="nhsuk-card__heading nhsuk-heading-s">Add your location to unlock nearby studies</h2>
      <p class="nhsuk-card__description">Studies running near you are easier to take part in. Adding your location helps us match you with trials in your area.</p>
      {{ button({
        text: "Add your location",
        href: "profile",
        classes: "nhsuk-button--secondary nhsuk-button--small nhsuk-u-margin-bottom-0"
      }) }}
    {% endcall %}

    <p class="nhsuk-body-s nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-2"><strong>Option 3: Simple text summary</strong></p>
    {% call card() %}
      <p class="nhsuk-body-s nhsuk-u-margin-bottom-2">Profile status: {{ tag({ text: "3 steps remaining", classes: "nhsuk-tag--yellow" }) }}</p>
      <p class="nhsuk-body-s">You have completed 2 of 5 profile sections.</p>
      <a class="nhsuk-link" href="profile">Review missing information</a>
    {% endcall %}
  </div>'''

details_new = f'''    <div class="nhsuk-u-margin-top-6">
      {INCLUDE}
    </div>
  </div>'''

replace_once(base + "details.html", details_old, details_new)


home_old = '''  <div class="nhsuk-grid-row">
  <div class="nhsuk-grid-column-full">

    <h2 class="nhsuk-heading-l nhsuk-u-margin-top-6">Compare profile status options</h2>
    <p class="nhsuk-body">Three GDS-compliant alternatives to the old profile completeness tracker, for comparison.</p>

    <p class="nhsuk-u-margin-bottom-2"><strong>Option 1: Task list</strong></p>
    {{ taskList({
      idPrefix: "profile-sections",
      items: [
        {
          title: { text: "Personal details" },
          href: "profile",
          hint: { text: "Your name, date of birth and contact details" },
          status: { text: "Completed", classes: "nhsuk-task-list__status--completed" }
        },
        {
          title: { text: "Diagnosed conditions" },
          href: "profile",
          hint: { text: "The conditions we use to match you with relevant studies" },
          status: { text: "Completed", classes: "nhsuk-task-list__status--completed" }
        },
        {
          title: { text: "Location and travel" },
          href: "profile",
          hint: { text: "Helps us find studies running near you" },
          status: { tag: { text: "Incomplete", colour: "blue" } }
        },
        {
          title: { text: "Areas of interest" },
          href: "profile",
          hint: { text: "The types of research you would like to hear about" },
          status: { tag: { text: "Incomplete", colour: "blue" } }
        }
      ]
    }) }}

    <p class="nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-2"><strong>Option 2: Action card</strong></p>
    {% call card({ feature: true }) %}
      {{ tag({ text: "Action required", classes: "nhsuk-tag--yellow nhsuk-u-margin-bottom-3" }) }}
      <h2 class="nhsuk-card__heading nhsuk-heading-s">Add your location to unlock nearby studies</h2>
      <p class="nhsuk-card__description">Studies running near you are easier to take part in. Adding your location helps us match you with trials in your area.</p>
      {{ button({
        text: "Add your location",
        href: "profile",
        classes: "nhsuk-button--secondary nhsuk-u-margin-bottom-0"
      }) }}
    {% endcall %}

    <p class="nhsuk-u-margin-top-6 nhsuk-u-margin-bottom-2"><strong>Option 3: Simple text summary</strong></p>
    {% call card() %}
      <p class="nhsuk-body nhsuk-u-margin-bottom-2">Profile status: {{ tag({ text: "3 steps remaining", classes: "nhsuk-tag--yellow" }) }}</p>
      <p class="nhsuk-body">You have completed 2 of 5 profile sections.</p>
      <a class="nhsuk-link" href="profile">Review missing information</a>
    {% endcall %}

  </div>
</div>'''

home_new = f'''  <div class="nhsuk-grid-row">
  <div class="nhsuk-grid-column-full">

    <div class="nhsuk-u-margin-top-6">
      {INCLUDE}
    </div>

  </div>
</div>'''

replace_once(base + "home.html", home_old, home_new)

print("ALL ROLLOUT EDITS APPLIED OK")
