---
name: home-assistant-mcp-integration
description: Skill for connecting to and using Home Assistant MCP server for smart home control and automation
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Home Assistant MCP Integration

This skill provides guidance for connecting to and using the Home Assistant MCP server to control and monitor your smart home devices and automations.

## Overview
The Home Assistant MCP server exposes your Home Assistant entities and services as MCP tools, allowing natural language control of lights, switches, sensors, climate devices, and more.

## Prerequisites
- Home Assistant instance running and accessible
- Valid long-lived access token for authentication
- native-mcp skill loaded

## Configuration
The Home Assistant MCP server should be configured in ~/.hermes/config.yaml:
```yaml
mcp_servers:
  home-assistant:
    url: "http://10.1.1.13:8123/api/mcp"
    headers:
      Authorization: "Bearer <REDACTED>"
    timeout: 30
    connect_timeout: 10
```

## Available Tools
Once connected, these tools are available (prefixed with mcp_home-assistant_):
- HassTurnOn - Turn on/activate entities (lights, switches, etc.)
- HassTurnOff - Turn off/deactivate entities
- HassToggle - Toggle entity state
- HassCallService - Call any Home Assistant service
- HassGetStates - Get states of entities matching filters
- And many more for controlling every aspect of your Home Assistant setup

## Usage Examples
```bash
# List all available Home Assistant MCP tools
mcp_home-assistant_list_tools

# Turn on a light
mcp_home-assistant_HassTurnOn --name "light.living_room"

# Get sensor states
mcp_home-assistant_HassGetStates --domain "sensor"

# Check if a door is open
mcp_home-assistant_HassGetStates --entity_id "binary_sensor.garage_door"

# Call a service (e.g., notify)
mcp_home-assistant_HassCallService --domain "notify" --service "mobile_app_iphone" --data '{"message": "Hello from Hermes!"}'

# Toggle a switch
mcp_home-assistant_HassToggle --entity_id "switch.outdoor_lights"
```

## Best Practices
1. Use friendly names or entity IDs when referencing devices
2. Check current state before making changes when needed
3. Use appropriate domains (light, switch, climate, etc.) for filtering
4. Monitor responses to confirm actions succeeded
5. Combine multiple tools for complex automations (e.g., get state then act on it)

## Common Use Cases
- Lighting control: Turn lights on/off, adjust brightness, change colors
- Climate control: Adjust thermostat, set modes, control fans
- Security: Check door/window locks, arm/disarm alarms, view camera feeds
- Entertainment: Control media players, adjust volume, select inputs
- Automation: Trigger scenes, run scripts, execute automations
- Monitoring: Check sensor values (temperature, humidity, motion, etc.)
- Notifications: Send alerts via mobile app, email, or other services

## Examples
```bash
# Turn on the kitchen light to 75% brightness
mcp_home-assistant_HassTurnOn --name "light.kitchen" --data '{"brightness_pct": 75}'

# Set thermostat to 72 degrees in heat mode
mcp_home-assistant_HassCallService --domain "climate" --service "set_temperature" --data '{"entity_id": "climate.home", "temperature": 72}' --data '{"entity_id": "climate.home", "hvac_mode": "heat"}'

# Get all sensor readings
mcp_home-assistant_HassGetStates --domain "sensor"

# Check if front door is locked
mcp_home-assistant_HassGetStates --entity_id "lock.front_door"

# Send a notification to your phone
mcp_home-assistant_HassCallService --domain "notify" --service "mobile_app_your_phone" --data '{"message": "Home Assistant MCP is working!", "title": "Hermes Agent"}'

# Execute a scene (e.g., "Movie Night")
mcp_home-assistant_HassCallService --domain "scene" --service "turn_on" --data '{"entity_id": "scene.movie_night"}'
```
---