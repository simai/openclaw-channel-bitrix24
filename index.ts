import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { bitrix24ChannelPlugin } from "./src/channel.js";

const plugin = {
  id: "bitrix24",
  name: "Bitrix24",
  description: "Bitrix24 channel plugin (scaffold)",
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {},
  },
  register(api: OpenClawPluginApi) {
    // TODO: wire runtime helpers and transport implementations.
    api.registerChannel({ plugin: bitrix24ChannelPlugin as never });
  },
};

export default plugin;
