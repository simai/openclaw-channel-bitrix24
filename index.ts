import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { bitrix24ChannelPlugin } from "./src/channel.js";
import { getBitrix24PluginConfig } from "./src/config.js";
import { handleBitrixInboundHttp } from "./src/http-inbound.js";
import { setBitrix24Runtime, setInboundRoutePath } from "./src/runtime.js";

const plugin = {
  id: "bitrix24",
  name: "Bitrix24",
  description: "Bitrix24 channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setBitrix24Runtime(api.runtime);

    const pluginCfg = getBitrix24PluginConfig(api.config as any);
    const inboundPath = (pluginCfg.direct?.webhookPath || "/bitrix24/webhook").trim() || "/bitrix24/webhook";
    setInboundRoutePath(inboundPath);

    api.registerHttpRoute({
      path: inboundPath,
      handler: async (req, res) => {
        await handleBitrixInboundHttp(req, res);
      },
    });

    api.registerChannel({ plugin: bitrix24ChannelPlugin });
  },
};

export default plugin;
