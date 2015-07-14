# Kodama -- D3 Tooltip

Kodama is a D3-based tooltip system designed to be simple, fast and small with a fluent API. Tooltips are evaluated in a lazy fashion, allowing thousands to potentially coexist (virtually) in the same context without suffering a performance hit. It can be styled without CSS classes and can support a preferred directional 'gravity' that will adjust itself so as to stay on the screen. It will follow the mouse by default, but can be locked to float about a specific target node as well.

It can be used across an entire site for consistency, but integrates canonically with D3's API. If using jQuery in addition to D3, the library installs a tiny plugin to add tooltips to any jQuery selection (if it finds jQuery or Zepto when initialized). 

## Installation

```bash
$ npm install kodama
```

## Basic Usage

The Kodama tooltip is a single shared instance that moves with the mouse, automatically positioning itself to stay on the screen. The contents of the tooltip are generated with the use of a 'tooltip data object' defined below.
(note: Supplying a ```null``` value for the 'tooltip data object'  will hide the tooltip.)

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
        gravity: 'northeast',
        target: some_dom_node_or_selection,
        by: 'top'
    }

```

Supplying a ```null``` value will hide the tooltip.
(note: all properties are optional -- but a title and/or items are core)

## Tooltip Themes

Themes are Javascript objects that apply inline CSS styles to parts of the tooltip.
Themes can be registered globally with the ```themeRegistry``` method. 

The tooltip itself has an HTML template where the names below correspond to the inline styles applied:

```html

    <div name="frame">
        <div name="title">
        <table>
            <tr>
                <td name="item_title" />
                <td name="item_value" />
            </tr>
            <tr>
                <td name="item_title" />
                <td name="item_value" />
            </tr>
        </table>
    </div>

```

The default style, registered as the name 'kodama', looks like:

```javascript

    var defaultThemeConfig = 
    {
        frame: {
            padding: '4px',
            background: 'linear-gradient(to top, rgb(16, 74, 105) 0%, rgb(14, 96, 125) 90%)',
            'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
            'border': '1px solid rgb(57, 208, 204)',
            color: 'rgb(245,240,220)',
            'border-radius': '4px',
            'font-size': '12px',
            'box-shadow': '0px 1px 3px rgba(0,20,40,.5)'
        },
        title: {'text-align': 'center', 'padding': '4px'},
        item_title: {'text-align': 'right', 'color': 'rgb(220,200,120)'},
        item_value: {'padding': '1px 2px 1px 10px', 'color': 'rgb(234, 224, 184)'}
        options: null
    };
    
    d3.kodama.themeRegistry('kodama', defaultThemeConfig);

```

Note that the theme can include an 'options' object that will be applied as default settings for the theme, such as a preferred gravity, distance, etc.


## Examples

Examples and demos can be found at [the github.io page](http://darkmarmot.github.io/kodama/ "Kodama Tooltip Demos").
Note: The demo page is still VERY MUCH under construction. Expect 3 or 4 more examples in the next few weeks.

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
|holdDuration | duration: number | Sets the default duration in milliseconds to activate a tooltip by holding the mouse still above a target. Original default is 0 (instant). |
|fadeInDuration | duration: number | Sets the default duration in milliseconds for a tooltip to fade-in. Original default is 0 (instant). |
|fadeOutDuration | duration: number | Sets the default duration in milliseconds for a tooltip to fade-out. Original default is 500. |


### Tooltip Instance Configuration Methods

Methods invoked on the d3.kodama.tooltip() instance can be chained when used as setters. Call without arguments to inspect current instance values. Defaults will be derived from the global configuration methods listed above when the instance is created.

|Name | Parameters | Description |
|-----|------------------------|-------------|
|target | target: node/selection | Locks the tooltip instance to float about the target element. Use 'by' to provide a relative position. |
|by | direction: string  (any cardinal direction or css placement such as north, southwest, top, left, upper-right, etc.) | Set the relative position of the tooltip instance when used with a target element. Note that the gravity and distance modifiers still apply. |
|holdDuration | duration: number | Sets the duration in milliseconds to activate this tooltip by holding the mouse still above a target.|
|fadeInDuration | duration: number | Sets the duration in milliseconds for this tooltip to fade-in. |
|fadeOutDuration | duration: number | Sets the duration in milliseconds for this tooltip to fade-out. |
|gravity | direction: string (any cardinal direction or css placement such as north, southwest, top, left, upper-right, etc.) | Sets a favored default direction (floating away from the mouse) for this tooltip | 
|distance | distance: number | Sets the pixel distance between this tooltip and the mouse pointer. |
|theme | name: string | Sets the theme for this tooltip. Note: this theme name must be present in the global themeRegistry. |
|format | callback(data, key): function | Sets the format function for this tooltip. It takes the current data as an argument and returns a formatted object representing the tooltip display (see Tooltip Data Object). |
|show | data, key | Manually activates this tooltip using a formatter function if applied. This method is called automatically behind the scenes if the tooltip has been associated with a D3 selection using the 'call' method. |
|options | options: object | Sets multiple configuration options at once. |



