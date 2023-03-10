import {
  AppWallet,
  AssetMetadata,
  ForgeScript,
  largestFirst,
  Mint,
  Transaction,
} from "@meshsdk/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { KoiosProvider } from "@meshsdk/core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const recipientAddress = req.body.recipientAddress;
  const utxos = req.body.utxos;
  const koiosProvider = new KoiosProvider("preprod");

  const appWallet = new AppWallet({
    networkId: 0,
    fetcher: koiosProvider,
    submitter: koiosProvider,
    key: {
      type: "mnemonic",
      words: [
        "topic",
        "myself",
        "coffee",
        "twelve",
        "very",
        "draw",
        "elegant",
        "family",
        "reopen",
        "left",
        "frozen",
        "shop",
        "basket",
        "mention",
        "ramp",
        "tower",
        "globe",
        "climb",
        "work",
        "blur",
        "just",
        "exchange",
        "coffee",
        "candy",
      ],
    },
  });

  const appWalletAddress = appWallet.getPaymentAddress();
  const forgingScript = ForgeScript.withOneSignature(appWalletAddress);

  const assetName = "Quotus Token";

  const assetMetadata: AssetMetadata = {
    name: "Mesh Blue Banner",
    // image: "ipfs://QmUvV8FPscURUEiEQDgLhUdU89ESC5W9dPYB9bGGuP32Tx",
    image: 'https://meshjs.dev/logo-mesh/mesh.png',
    mediaType: "image/jpg",
    description: "This NFT is minted by Quotus.",
  };

  const asset: Mint = {
    assetName: assetName,
    assetQuantity: "1",
    metadata: assetMetadata,
    label: "721",
    recipient: recipientAddress,
  };

  const costLovelace = "10000000";
  const selectedUtxos = largestFirst(costLovelace, utxos, true);
  const bankWalletAddress =
    "addr_test1qzmwuzc0qjenaljs2ytquyx8y8x02en3qxswlfcldwetaeuvldqg2n2p8y4kyjm8sqfyg0tpq9042atz0fr8c3grjmysm5e6yx";

  const tx = new Transaction({ initiator: appWallet });
  tx.setTxInputs(selectedUtxos);
  tx.mintAsset(forgingScript, asset);
  tx.sendLovelace(bankWalletAddress, costLovelace);
  tx.setChangeAddress(recipientAddress);
  const _unsignedTx = await tx.build();
  const unsignedTx = await appWallet.signTx(_unsignedTx, true);

  res.status(200).json({ unsignedTx: unsignedTx });
}
