[Home](./index) &gt; [kibana-plugin-public](./kibana-plugin-public.md) &gt; [UiSettingsClient](./kibana-plugin-public.uisettingsclient.md) &gt; [isDeclared](./kibana-plugin-public.uisettingsclient.isdeclared.md)

## UiSettingsClient.isDeclared() method

Returns true if the key is a "known" uiSetting, meaning it is either defined in the uiSettingDefaults or was previously added as a custom setting via the `set()` method.

<b>Signature:</b>

```typescript
isDeclared(key: string): boolean;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  key | <code>string</code> |  |

<b>Returns:</b>

`boolean`

