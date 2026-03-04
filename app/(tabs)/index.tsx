import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/constants/theme';
import 'expo-router/entry';
export default function BacklogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your backlog is empty.</Text>
      <Text style={styles.sub}>Go to Discover to add your first game.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text:      { color: colors.text,      fontSize: 18, fontWeight: '600' },
  sub:       { color: colors.textMuted, fontSize: 14, marginTop: 8 },
});