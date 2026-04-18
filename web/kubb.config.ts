import { defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";

export default defineConfig({
  root: ".",
  input: {
    path: "http://localhost:5000/swagger/v1/swagger.json",
  },
  output: {
    path: "./src/api/generated",
    clean: true,
    format: 'prettier'
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: {
        path: "types.ts",
      },
    }),
    pluginClient({
      output: {
        path: "client.ts",
      },
    }),
    pluginReactQuery({
      output: {
        path: "react-query.ts",
      },
    }),
    pluginZod({
      output: {
        path: "zod.ts",
      },
    }),
  ],
});
