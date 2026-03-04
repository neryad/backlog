import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/constants/theme';

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search for games here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text:      { color: colors.text, fontSize: 18 },
});