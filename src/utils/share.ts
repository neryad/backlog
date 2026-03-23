import { RefObject } from "react";
import { Alert, View } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

type ShareOptions = {
  width?: number;
  height?: number;
  dialogTitle: string;
  unavailableMessage?: string;
  errorMessage?: string;
};

export async function shareViewAsImage(
  ref: RefObject<View | null>,
  options: ShareOptions,
) {
  if (!ref.current) return false;

  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        "Sharing unavailable",
        options.unavailableMessage ??
          "Your device does not support native sharing.",
      );
      return false;
    }

    const uri = await captureRef(ref.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: options.width ?? 1080,
      height: options.height ?? 1920,
    });

    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: options.dialogTitle,
    });

    return true;
  } catch (error) {
    console.error(
      "[ShareView Error]",
      error instanceof Error ? error.message : String(error),
    );
    Alert.alert(
      "Could not share card",
      error instanceof Error && error.message
        ? error.message
        : (options.errorMessage ?? "Try again in a moment."),
    );
    return false;
  }
}
