import { Link, Redirect, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return <Redirect href={'/'} />;
  // return (
  //   <>
  //     <Stack.Screen options={{ title: 'Oops!' }} />
  //     <View style={styles.container}>
  //       <Text style={styles.text}>This screen doesn't exist.</Text>
  //       <Link href="/(auth)/login" style={styles.link}>
  //         <Text>Go to home screen!</Text>
  //       </Link>
  //     </View>
  //   </>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 600,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
