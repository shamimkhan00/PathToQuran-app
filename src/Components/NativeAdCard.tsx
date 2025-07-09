import React, { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeMediaView,
  NativeAssetType,
  TestIds,
  NativeAdEventType,
} from 'react-native-google-mobile-ads';

const NativeAdCard = () => {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  // Load the native ad on mount
  useEffect(() => {
    NativeAd.createForAdRequest(TestIds.NATIVE)
      .then(setNativeAd)
      .catch(console.error);
  }, []);

  // Handle events and clean up
  useEffect(() => {
    if (!nativeAd) return;

    const clickedListener = nativeAd.addAdEventListener(NativeAdEventType.CLICKED, () => {
      console.log('✅ Ad was clicked!');
    });

    return () => {
      clickedListener.remove();
      nativeAd.destroy();
    };
  }, [nativeAd]);

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd} style={{ padding: 10, borderRadius: 8, backgroundColor: '#f5f5f5' }}>
      {nativeAd.icon && (
        <NativeAsset assetType={"ICON" as NativeAssetType}>
          <Image source={{ uri: nativeAd.icon.url }} style={{ width: 40, height: 40 }} />
        </NativeAsset>
      )}

      <NativeAsset assetType={"HEADLINE" as NativeAssetType}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{nativeAd.headline}</Text>
      </NativeAsset>

      {nativeAd.body && (
        <NativeAsset assetType={"BODY" as NativeAssetType}>
          <Text>{nativeAd.body}</Text>
        </NativeAsset>
      )}

      <NativeMediaView style={{ height: 200, marginTop: 10 }} resizeMode="cover" />

      <Text style={{ color: '#888', fontSize: 12, marginTop: 5 }}>Sponsored</Text>
    </NativeAdView>
  );
};

export default NativeAdCard;
