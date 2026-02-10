import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { bitrix24ChannelPlugin } from "./src/channel.js";
import { setBitrix24Runtime } from "./src/runtime.js";

const plugin = {
  id: "bitrix24",
  name: "Bitrix24",
  description: "Bitrix24 channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setBitrix24Runtime(api.runtime);
    api.registerChannel({ plugin: bitrix24ChannelPlugin });
  },
};

export default plugin;
