# Bridge Configuration

Using the User Interface you can set up multiple bridges and configure each to use different filters for your entities.
Each bridge will be completely independent of the others and uses its own port for matter.

Open **HA+ Matter Hub** in the Home Assistant sidebar to access the bridge
configuration. The panel is available to administrators after the Marketplace
integration is configured.

> [!NOTE]
> You can use **one** bridge to connect to **multiple** controllers.
> See [this guide](../Guides/Connect%20Multiple%20Fabrics.md) for details how to set this up.

> [!WARNING]
> Alexa only supports port `5540`. Therefore, you cannot create multiple bridges to connect with Alexa.
> 
> There are users who managed to get it work using the following approach:
> 1. Create a bridge with port 5540
> 2. Connect your Alexa with that bridge
> 3. Change the port of the bridge
> 4. Verify if it is still working
> 5. Repeat for the next bridge

Every bridge has to have a `name` (string), `port` (number) and `filter` (object) property. The filter property has to
include an `include` (array) and an `exclude` (array) property.

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [],
    "exclude": []
  }
}
```

A include- or exclude-item is an object having a `type` and a `value` property.
The `type` can be one of:

- `pattern` - a pattern matching your entity ids
- `domain` - the domain you want to include or exclude
- `platform` - the integration you want to include or exclude
- `entity_category` -
  the [entity category](https://developers.home-assistant.io/docs/core/entity/#registry-properties) (`config` /
  `diagnostic`) you want to include or exclude
- `label` - the slug of a label you want to include or exclude
- `area` - the slug of an area you want to include or exclude

The `value` property is a string containing the corresponding value. You can add multiple include or exclude rules which
are then combined.
All entities which match one of the include-rules will be included, but all entities which match one of the exclude
rules will be excluded.

Labels have to be applied at an entity level, not under device.

> [!WARNING]
> When performing changes on entities, like adding or removing a label, you need to refresh the matter-hub application
> for the changes to take effect (e.g. edit the bridge or reload the integration).

Example configuration:

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [
      {
        "type": "label",
        "value": "my_voice_assist"
      },
      {
        "type": "pattern",
        "value": "light.awesome*"
      }
    ],
    "exclude": [
      {
        "type": "platform",
        "value": "hue"
      },
      {
        "type": "domain",
        "value": "fan"
      },
      {
        "type": "entity_category",
        "value": "diagnostic"
      }
    ]
  }
}
```

## Issues with labels

> [!WARNING]
>
> - Labels and areas in Home Assistant are technically represented by their "slugs".
> - Slugs are technical identifiers used in the background.
> - Slugs are always lowercase and only allow a-z and underscores, so everything else will be replaced with an `underscore`.
> - Even when renaming a label or area, the slug doesn't change. Never.
>
> You can retrieve the slug using the following templates in Home Assistant:
>
> - `{{ labels() }}` - returns all labels
> - `{{ labels("light.my_entity") }}` - returns the labels of a specific entity
> - `{{ areas() }}` - returns all areas

If you can’t get it working with your labels, you can delete your label and re-create it.

## Repeat matching commands

Open **HA+ Matter Hub** in the Home Assistant sidebar, edit a bridge, and find
**Repeat matching commands**. Each checkbox controls whether a request is
forwarded when Home Assistant already reports the requested value. These are
per-bridge settings and are saved with the rest of the bridge configuration.

| Category | Default | Requests controlled |
| --- | --- | --- |
| Shades | Off | Matching position and tilt targets, including open/close on position-capable shades |
| Brightness and volume levels | Off | Matching level targets |
| Light color and color temperature | Off | Matching hue/saturation and temperature targets |
| Climate | Off | Matching operating mode and target temperature writes |
| Fans | Off | Matching mode, speed and direction writes |
| On/off | On | Matching on/off commands for lights, switches and other devices |
| Locks | On | Matching lock/unlock commands |
| Media input selection | On | Selecting the current input again |

The defaults preserve existing bridge behavior. For shades controlled by a
separate remote, enable **Shades** so stale position estimates do not prevent
received open/close and position requests from reaching Home Assistant. Stop
commands and relative commands keep their existing behavior. Shade commands
without position feedback continue to be forwarded because there is no matching
position to compare.

A checked setting forwards received requests; it does not automatically retry,
poll, or replay Home Assistant status updates. Google or another controller may
still choose not to send a request. The existing short action debounce remains
in place, so rapid requests for the same action may be combined.

The JSON editor exposes the same optional `repeatCommands` object, for example:

```json
"repeatCommands": {
  "shades": true,
  "brightness": false,
  "color": false,
  "climate": false,
  "fans": false,
  "onOff": true,
  "locks": true,
  "mediaInputs": true
}
```

Omitted categories use the defaults above; existing configurations do not need a
migration.
