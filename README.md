# Kodama -- D3 Tooltip

## Installation

## Usage and Examples


## API Documentation

### Kodama Global Configuration Methods

Methods invoked on the d3.kodama namespace can be chained when used as setters. If called without an argument, each will return the current global setting. These settings are applied as the defaults for all Kodama tooltips.

|Name | Parameters | Description |
|-----|------------------------|-------------|
|gravity | direction: string (any cardinal direction or css placement such as north, southwest, top, left, upper-right, etc.) | Sets a favored default direction (floating away from the mouse) for all tooltips | 
|distance | distance: number | Sets the default pixel distance between the tooltip box and the mouse pointer. |
|theme | name: string | Sets the default theme for tooltips. Note: this theme name must be present in the themeRegistry. |
|themeRegistry | name: string, config: object | Adds or updates named themes that can be used by tooltips. The config object should contain CSS as JSON with object properties named: frame, pane, title, item_title and item_value. the default theme for tooltips. Note: this theme name must be in the themeRegistry. |
|tooltip | none | Returns a configuration instance to be used by d3's 'call' method; its API is listed in the next section. |

### Tooltip Instance Configuration Methods

Methods invoked on the d3.kodama.tooltip() instance can be chained when used as setters. Defaults will be derived from the global configuration methods listed above.

|Name | Parameters | Description |
|-----|------------------------|-------------|
|gravity | direction: string (any cardinal direction or css placement such as north, southwest, top, left, upper-right, etc.) | Sets a favored default direction (floating away from the mouse) for this tooltip | 
|distance | distance: number | Sets the default pixel distance between this tooltip box and the mouse pointer. |
|theme | name: string | Sets the theme for this tooltip. Note: this theme name must be present in the global themeRegistry. |
|format | callback(data): function | Sets the default format function for the tooltip. It takes the current data as an argument and returns a formatted object representing the tooltip display (as detailed below). |
|show | callback(data, formatter): function | Manually activates the tooltip, formatting the given data into a tooltip display object (detailed below) using a formatter function if given. This method is called automatically behind the scenes if the tooltip has been associated with a D3 selection using the 'call' method. |


