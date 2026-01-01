import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PrivacyPolicy = ({ visible, onClose }: Props) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>

          <Text style={styles.text}>
            PathToQuran respects your privacy. We do not collect personal
            information directly from users.
          </Text>

          <Text style={styles.heading}>Advertising</Text>
          <Text style={styles.text}>
            This app may display advertisements served by third-party ad
            providers such as Google AdMob. These services may collect device
            identifiers to show relevant ads.
          </Text>

          <Text style={styles.heading}>Children’s Privacy</Text>
          <Text style={styles.text}>
            This app is intended for educational and religious purposes and does
            not knowingly collect data from children under 13.
          </Text>

          <Text style={styles.heading}>Contact</Text>
          <Text style={styles.text}>
            shamim134579@gmail.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09130f',
  },
  closeBtn: {
    padding: 12,
    alignItems: 'flex-end',
  },
  closeText: {
    color: '#1e916c',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e916c',
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e916c',
    marginTop: 14,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
  },
});
