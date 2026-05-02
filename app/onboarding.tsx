import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../src/constants/theme";
import { fontFamily } from "../src/constants/typography";
import { useUIStore } from "../src/store/ui.store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    key: "1",
    image: require("../assets/onboarding/slide-1-welcome.jpeg"),
    title: "Bienvenido a Playlogged",
    description: "Tu biblioteca personal para nunca perder un juego de vista.",
  },
  {
    key: "2",
    image: require("../assets/onboarding/slide-2-orfer-yout-blacklog.png"),
    title: "Organiza tu backlog",
    description:
      "Agrega cualquier juego y clasifícalo: Jugando, Completado, En espera y más.",
  },
  {
    key: "3",
    image: require("../assets/onboarding/slide-4-swipe-gestures.png"),
    title: "Actualiza con un swipe",
    description:
      "Desliza la carta a la derecha para empezar a jugar, a la izquierda para completar.",
  },
  {
    key: "4",
    image: require("../assets/onboarding/slide-4-what-to-play.png"),
    title: "Elige qué jugar hoy",
    description:
      'El botón "Siguiente a jugar" te sugiere opciones: al azar, el más antiguo o el mejor valorado.',
  },
  {
    key: "5",
    image: require("../assets/onboarding/slide-5-shared-conect.png"),
    title: "Comparte y conecta",
    description:
      "Agrega amigos, compara backlogs y comparte tus stats en redes sociales.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useUIStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  const finish = () => {
    setHasSeenOnboarding(true);
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setCurrentIndex(next);
    }
  };

  const handleScrollEnd = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isLast && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={finish}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <View style={styles.imageWrapper}>
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isLast ? "Empezar" : "Siguiente"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    color: colors.foregroundMuted,
    fontFamily: fontFamily.sans,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    paddingBottom: spacing.md,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    color: colors.foreground,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: fontFamily.sans,
    fontSize: 15,
    color: colors.foregroundMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  button: {
    width: "100%",
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
    color: colors.primaryForeground,
  },
});
