# Kodama -- D3 Tooltip

Kodama is a D3-based tooltip system designed to be simple, fast and small with a fluent API. It can be styled without CSS classes (which I view as terribly heretical global variables for any large, modular application). And it can support a preferred directional 'gravity' that will adjust itself so as to stay on the screen.

It can be used across an entire site for consistency, but integrates canonically with D3's API. If using jQuery in addition to D3, you can include a tiny plugin to add tooltips to any jQuery selection. 

I had two primary motivations for writing this library. First, I had a data visualization application whose highest hit on the CPU profiler was Bootstrap's Popover. Thus, I really wanted to replace Boostrap. Second, I thought making a tooltip based on D3 would be kind of fun.

## Installation

```bash
$ npm install kodama
```

## Basic Usage

The Kodama tooltip is a single shared instance that moves with the mouse, automatically positioning itself to stay on the screen. The contents of the tooltip are generated with the use of a 'tooltip data object' defined below.

There are 4 general ways to invoke the Kodama tooltip.

1. The D3 selection data is COMPOSED of tooltip data objects.
    ```javascript
    
      d3_enter_selection
        .call(d3.kodama.tooltip()); 
        // the tooltips ARE the data
        
    ```
2. The D3 selection data will be TRANSFORMED into tooltip data objects with a format function.
    ```javascript
    
      d3_enter_selection 
        .call(d3.kodama.tooltip().format(formatFunc)); 
        // this is the common use case -- tooltips FROM data
        
    ```
3. The D3 selection will update the tooltip data object on an event.
    ```
    
      d3_enter_selection
        .on('mousemove', function(d, i){
            var subData = getDataAtPosition(d3.mouse(this));
            d3.kodama.format(formatFunc).show(subData); 
        });
        // e.g., updating values while moving across a graph
        
    ```
4. A jQuery selection configured with a tooltip data object.
    ```javascript
    
      jquery_selection
        .kodama_tooltip(tooltip_data_object);
        // the options object is optional (will use global library settings)
        
    ```
    
## Tooltip Data Object

The data used to generate a tooltip should use this format:

```javascript

    {
        title: 'Kodama Tooltip',
        items: [
            {title: 'Extends', value: 'D3.js'},
            {title: 'Western Archetype', value: 'Dryad'},
            {title: 'Anime Source', value: 'Princess Mononoke'}
        ],
        theme: 'white_wolf',
        distance: 40,
        gravity: 'northeast'
    }

```

(note: all properties are optional -- but a title and/or items are core)

## Examples


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
|format | callback(data, key): function | Sets the default format function for the tooltip. It takes the current data as an argument and returns a formatted object representing the tooltip display (see Tooltip Data Object). |
|show | data, key | Manually activates the tooltip using a formatter function if applied. This method is called automatically behind the scenes if the tooltip has been associated with a D3 selection using the 'call' method. |
|options | options: object | Sets multiple default configuration options at once. |



