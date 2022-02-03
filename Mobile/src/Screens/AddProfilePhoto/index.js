import { View, Text, Image, Pressable, SafeAreaView } from 'react-native';
// import Image from 'react-native-fast-image'
import React from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { Buton, Typo } from '../../Components';
import {
  BLACK,
  WIDTH,
  WHITE,
  GRAY,
  BROWN,
  HALF_BLACK,
  HALF_GRAY,
  QUARTER_GRAY,
  HALF_BROWN,
  QUARTER_BROWN,
  HEIGHT,
  AUTH
} from '../../Utils/Constants';
import { Bar } from 'react-native-progress';
import {
  CHECK_GALLERY_PERMISSIONS,
  compressImage,
  ImagePicker,
  showAlert,
  uploadImageToFirebase
} from '../../Utils/HelperFunctions';
import { TINY_PNG_TOKEN, TINY_PNG_URL } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import BG from '../../assets/BG.png';

// console.log('TINY', TINY_PNG_TOKEN);

const AddProfilePhoto = ({ navigation }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading.effects.Account);
  const [ loader, setLoader ] = React.useState(false);
  const [ state, setState ] = React.useState({
    image: {},
    progress: 0,
    progressText: 'Uploading your photo for processing'
  });

  const pickImage = () =>
    CHECK_GALLERY_PERMISSIONS((res) => {
      if (!res.success)
        return showAlert(
          'Something here',
          'Please make sure you give permissions to Dancebox to your gallery in order to be able to continue'
        );
      return ImagePicker((result) => setState((r) => ({ ...r, image: result })));
    });

  const compressUpload = () => {
    setLoader(true);
    if (!Object.keys(state.image).length)
      return showAlert(
        'Error updating your details',
        'You need to first select a photo to add to your profile and then click finish, try again'
      );

    compressImage(
      state.image,
      (p) => setState((r) => ({ ...r, ...p })),
      async (res) => {
        const { base64, ...rest } = res;
        await uploadImageToFirebase(
          `/profiles/${rest.fileName}`,
          base64,
          (progress) =>
            setState((r) => ({
              ...r,
              progress: progress === 100 ? 0 : progress,
              progressText: 'Uploading your image, please wait...'
            })),
          (e) => {
            setLoader(false);
            showAlert('Something went wrong', e);
          },
          (photoURL) =>
            dispatch.Account.updateAccountDetails({
              uid: AUTH.currentUser.uid,
              payload: { photoURL },
              callback: (res) => {
                setLoader(false);
                if (!res.success) return showAlert('Something went wrong', res.result);
                return navigation.navigate('Home', { screen: 'Home' });
              }
            })
        );
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <Image source={BG} style={{ position: 'absolute', width: '100%', height: HEIGHT }} /> */}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Typo text="Select an image to show on your profile" size={16} />

          <View
            style={{
              marginVertical: RFValue(20),
              width: 3.6 / 4 * WIDTH,
              height: 3 / 4 * WIDTH,
              backgroundColor: QUARTER_BROWN
            }}
          >
            {state.image && state.image.uri ? (
              <Pressable onPress={pickImage}>
                <Image
                  style={{ width: '100%', height: '100%', borderColor: GRAY }}
                  source={{ uri: state.image.uri }}
                  resizeMode="cover"
                />
              </Pressable>
            ) : (
              <Pressable
                style={{
                  width: '100%',
                  height: '100%',
                  // borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: QUARTER_BROWN
                }}
                onPress={pickImage}
              >
                <Typo text="Select photo" size={16} />
              </Pressable>
            )}
          </View>

          {state.progress > 0 ? (
            <View style={{ marginBottom: RFValue(0) }}>
              <Typo text={`${state.progressText} - ${state.progress}%`} size={12} color={GRAY} />
              <Bar
                progress={state.progress / 100}
                width={3.4 / 4 * WIDTH}
                color={BLACK}
                style={{ marginVertical: RFValue(5), borderRadius: 0 }}
              />
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: 3.6 / 4 * WIDTH
            }}
          >
            <Buton
              title="Skip"
              extStyles={{
                width: '48%',
                backgroundColor: 'transparent',
                borderWidth: 1,
                height: RFValue(35),
                borderColor: BLACK
              }}
              textStyles={{ color: BLACK }}
              onPress={() =>
                !loading.updateAccountDetails && !loader ? navigation.navigate('Home', { screen: 'Home' }) : null}
              loading={loading.updateAccountDetails || loader}
              showLoader={false}
            />
            <Buton
              title="Finish"
              extStyles={{ width: '48%', backgroundColor: BLACK, height: RFValue(35) }}
              textStyles={{ color: WHITE }}
              onPress={() => (!loading.updateAccountDetails && !loader ? compressUpload() : null)}
              loading={loading.updateAccountDetails || loader}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AddProfilePhoto;