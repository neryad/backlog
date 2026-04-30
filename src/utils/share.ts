import { RefObject } from "react";
import { Alert, View } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

type ShareOptions = {
  dialogTitle: string;
  unavailableMessage?: string;
  errorMessage?: string;
};

export async function shareViewAsImage(
  ref: RefObject<View | null>,
  options: ShareOptions,
) {
  const uri = await captureViewImageUri(ref);
  if (!uri) return false;

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

export async function captureViewImageUri(
  ref: RefObject<View | null>,
) {
  if (!ref.current) return null;

  try {
    const uri = await captureRef(ref.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    return uri;
  } catch (error) {
    console.error(
      "[CaptureView Error]",
      error instanceof Error ? error.message : String(error),
    );
    Alert.alert("Could not generate image", "Try again in a moment.");
    return null;
  }
}
