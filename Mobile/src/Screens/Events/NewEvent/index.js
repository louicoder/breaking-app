import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Keyboard,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONSTANTS, HelperFunctions } from '../../../Utils';
import { PERMISSIONS } from 'react-native-permissions';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarList, Agenda } from 'react-native-calendars';
import moment from 'moment';
import DatePicker from '../../../Components/DatePicker';
import Calendar from '../../../Components/Calendar';
import OptionsSelector from './OptionsSelector';
import Modal from './Modal';
import ModalX from '../../../Components/Modal';
import Time from './Time';
import StartDate from './StartDate';
import EndDate from './EndDate';
import { useDispatch } from 'react-redux';
import { uploadImage } from '../../../Utils/HelperFunctions';
import { QUERIES } from '../../../Firebase';
import LoadingModal from '../../../Components/LoadingModal';
import { useSelector } from 'react-redux';
import { Button } from '../../../Components';

const { height } = Dimensions.get('window');
const NewEvent = ({ navigation }) => {
  const dispatch = useDispatch();
  const [ visible, setVisible ] = React.useState(true);
  const [ user, setUser ] = React.useState(true);
  const loading = useSelector((state) => state.loading.effects.Events);
  // const { user } = useSelector((state) => state.Account);
  const [ imageLoading, setImageLoading ] = React.useState(false);

  const [ state, setState ] = React.useState({
    title: 'Online battle callout 2021',
    startDate: new Date(),
    endDate: new Date(),
    image: {},
    venue: 'Kamwokya playground',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Indicant pueri, in quibus ut in speculis natura cernitur. Magni enim aestimabat pecuniam non modo non contra leges, sed etiam legibus partam. Vitae autem degendae ratio maxime quidem illis placuit quieta. Sed eum qui audiebant, quoad poterant, defendebant sententiam suam. Duo Reges: constructio interrete. Nunc dicam de voluptate, nihil scilicet novi, ea tamen, quae te ipsum probaturum esse confidam. Itaque in rebus minime obscuris non multus est apud eos disserendi labor. Nescio quo modo praetervolavit oratio',
    tags: [],
    tagsVisible: true,
    // date: moment(new Date()).format('YYYY-MM-DD'),
    price: null,
    free: true,
    // datePickerVisible: false,
    modalVisible: false,
    modalComponent: 'startdate',
    // amount: 0,
    judgingNotes:
      'This battle will be strictly judged by the audience online and the results be available for everyone at any time to take a look',
    judgingCriteria: 'Judges',
    noOfJudges: 3,
    loading: false,
    ticketCompany: 'Kafeero foundation'
    // dateTime: new Date().toString()
  });

  React.useEffect(() => {
    HelperFunctions.getUser(({ success, result }) => success && setUser(result));
  }, []);

  const selectImage = async () =>
    await HelperFunctions.CHECK_GALLERY_PERMISSIONS(async (res) => {
      // console.log('rESult', res);
      if (!res.success) {
        return HelperFunctions.Notify('Error accessing gallery', res.result);
        // selectImage();
      }
      HelperFunctions.ImagePicker((image) => {
        // console.log('REsponse', image);
        if (image.uri) setState({ ...state, image });
      });
    });
  // console.log('tags', state.tags);

  const RenderModComponent = ({ component, endDate, startDate, setDate, closeModal }) => {
    // console.log('CReate');
    switch (component) {
      case 'time':
        return <Time />;
      case 'startdate':
        return <StartDate setDate={setDate} date={startDate} closeModal={closeModal} />;
      case 'enddate':
        return <EndDate setDate={setDate} date={endDate} closeModal={closeModal} />;
    }
  };

  const uploadEventImage = async (eventId) => {
    setImageLoading(true);

    await HelperFunctions.uploadImage(
      `Events/${eventId}/${state.image.fileName}`,
      state.image.uri,
      (progress) => {
        setState({ ...state, progress });
        setImageLoading(true);
      },
      (error) => {
        // setState({ ...state, progressVisible: false, progress: 0 });
        setImageLoading(false);
        Alert.alert('Error', error);
      },
      async (imageUrl) =>
        dispatch.Events.updateEvent({
          eventId,
          payload: { imageUrl },
          callback: (resp) => {
            // console.log('REsp from update image', resp);
            setImageLoading(false);

            if (!resp.success) return HelperFunctions.Notify('Error adding event photo', resp.result);
            return navigation.navigate('Events');
          }
        })
    );
  };

  const clearFields = () =>
    setState({ ...state, caption: '', image: {}, topics: [], progress: 0, progressVisible: false });

  const createEvent = async () => {
    // setState({ ...state, loading: true });
    Keyboard.dismiss();
    const dateCreated = new Date().toISOString();
    const { image, modalVisible, modalComponent, loading, price, ...rest } = state;
    const criteria = state.judgingCriteria.toLowerCase();
    const payload = {
      ...rest,
      dateCreated,
      likes: [],
      comments: [],
      attending: [],
      participating: [],
      imageUrl: '',
      price: state.free ? '0' : price,
      judgingCriteria: criteria,
      authorId: user._id
    };

    dispatch.Events.createEvent({
      payload,
      callback: (res) => {
        if (!res.success) return HelperFunctions.Notify('Error', res.result);
        if (state.image.uri && res.success) {
          return uploadEventImage(res.result._id);
        }
        setImageLoading(false);
        return navigation.navigate('Events');
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LoadingModal isVisible={loading.createEvent || imageLoading} />
      {state.modalVisible && (
        <Modal visible={state.modalVisible} closeModal={() => setState({ ...state, modalVisible: false })}>
          <RenderModComponent
            component={state.modalComponent}
            setDate={(field, date) => setState({ ...state, [field]: date })}
            endDate={state.endDate}
            startDate={state.startDate}
            closeModal={() => setState({ ...state, modalVisible: false })}
          />
        </Modal>
      )}

      {/* <Modal visible={visible}>
        <View style={{ width: '100%', height: RFValue(200), position: 'absolute', bottom: 0 }} />
      </Modal> */}
      {/* <View style={{ flex: 1 }}> */}
      <KeyboardAwareScrollView
        style={{ flex1: 1 }}
        // scrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps="handled"
        // showsVerticalScrollIndicator={false}
      >
        {state.image.uri && state.image.uri.length ? (
          <ImageBackground
            source={{ uri: state.image && state.image.uri }}
            style={{ width: '100%', height: RFValue(300) }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                backgroundColor: 'rgba(0,0,0,.55)'
              }}
            >
              <Pressable
                onPress={selectImage}
                style={{ marginHorizontal: RFValue(15), borderWidth: 1, borderColor: '#fff', padding: RFValue(10) }}
              >
                <Text style={{ color: '#fff' }}> Change Image</Text>
              </Pressable>
              <Pressable
                style={{ backgroundColor: '#fff', borderWidth: 1, padding: RFValue(10) }}
                onPress={() => setState({ ...state, image: {} })}
              >
                <Text style={{ color: '#000' }}> Remove Image</Text>
              </Pressable>
            </View>
          </ImageBackground>
        ) : null}

        {!state.image.uri ? (
          <Pressable
            onPress={selectImage}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: RFValue(300),
              backgroundColor: '#eee'
            }}
          >
            <Icon name="camera-plus" size={RFValue(100)} color="#aaa" />
            <Pressable onPress={selectImage}>
              <Text style={{ color: '#aaa', fontSize: RFValue(14) }}>Click to add an photo</Text>
            </Pressable>
          </Pressable>
        ) : null}

        <View style={{ width: '100%', paddingHorizontal: RFValue(10), marginTop: RFValue(10), alignSelf: 'center' }}>
          <Text style={{ fontSize: RFValue(14) }}>Enter title of the event:</Text>
          <TextInput
            scrollEnabled={false}
            value={state.title}
            onChangeText={(title) => setState({ ...state, title })}
            placeholder="Enter event title"
            // multiline
            style={{
              backgroundColor: '#eee',
              height: RFValue(50),
              marginVertical: RFValue(10),
              fontSize: RFValue(14),
              paddingHorizontal: RFValue(10)

              // maxHeight: RFValue(200)
            }}
          />
        </View>

        <Pressable
          onPress={() => setState({ ...state, tagsVisible: !state.tagsVisible })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: RFValue(10),
            marginHorizontal: RFValue(10)
          }}
        >
          <Text style={{ fontSize: RFValue(14) }}>Add tags to your blog</Text>
          <Icon name={state.tagsVisible ? 'chevron-up' : 'chevron-down'} size={RFValue(30)} />
        </Pressable>
        {state.tagsVisible ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: RFValue(10) }}>
            {CONSTANTS.INTERESTS.map((item) => (
              <Pressable
                key={HelperFunctions.keyGenerator()}
                style={{
                  marginRight: RFValue(10),
                  backgroundColor: state.tags && state.tags.includes(item) ? '#000' : 'transparent',
                  borderWidth: 1,
                  borderColor: state.tags && state.tags.includes(item) ? '#000' : '#ccc',
                  borderRadius: RFValue(50),
                  padding: RFValue(10),
                  marginBottom: RFValue(10)
                }}
                onPress={() =>
                  setState({
                    ...state,
                    tags:
                      state.tags && state.tags.includes(item)
                        ? state.tags.filter((it) => it !== item)
                        : [ ...state.tags, item ]
                  })}
                // onPress={() => alert(item)}
              >
                <Text style={{ color: state.tags && state.tags.includes(item) ? '#fff' : '#000' }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <DatePicker
          onPress={() => setState({ ...state, modalVisible: true, modalComponent: 'startdate' })}
          // setDate={(startDate) => setState({ ...state, startDate })}
          title="Select event start date"
          date={state.startDate}
        />

        <DatePicker
          onPress={() => setState({ ...state, modalVisible: true, modalComponent: 'enddate' })}
          // setDate={(endDate) => setState({ ...state, endDate })}
          title="Select event end date"
          date={state.endDate}
        />

        {/* free */}
        <View style={{ margin: RFValue(10) }}>
          <OptionsSelector
            setItem={(price) => setState({ ...state, free: price === 'free' })}
            items={[ 'free', 'paid' ]}
            header="Select event pricing below"
            defaultValue="free"
          />

          {!state.free && <Text style={{ fontSize: RFValue(14) }}>Enter event price below:</Text>}
          {!state.free ? (
            <TextInput
              keyboardType="number-pad"
              style={{
                backgroundColor: '#eee',
                height: RFValue(50),
                fontSize: state.price && state.price ? RFValue(18) : RFValue(14),
                paddingHorizontal: RFValue(10),
                marginVertical: RFValue(10)
              }}
              placeholder="Enter event price in Ugx"
              value={state.price}
              onChangeText={(price) => setState({ ...state, price })}
            />
          ) : null}

          <OptionsSelector
            setItem={(judgingCriteria) => setState({ ...state, judgingCriteria })}
            items={[ 'Judges', 'Audience', 'Both' ]}
            header="Select the event judging criteria"
            extStyles={{ width: '33.33%' }}
            defaultValue="Judges"
          />
          <OptionsSelector
            setItem={(noOfJudges) =>
              setState({ ...state, noOfJudges: noOfJudges && parseInt(noOfJudges.split(' ')[0]) })}
            items={[ '3 judges', '5 judges' ]}
            header="Select how many judges on panel"
            defaultValue="3 judges"
          />

          <Text style={{ fontSize: RFValue(14) }}>Enter Venue for event:</Text>
          <TextInput
            scrollEnabled={false}
            value={state.venue}
            onChangeText={(venue) => setState({ ...state, venue })}
            placeholder="Enter event venue"
            // multiline
            style={{
              backgroundColor: '#eee',
              minHeight: RFValue(50),
              // height: RFValue(50),
              marginVertical: RFValue(10),
              fontSize: RFValue(14),
              paddingHorizontal: RFValue(10)
              // maxHeight: RFValue(200)
            }}
          />

          <Text style={{ fontSize: RFValue(14) }}>Enter judging notes:</Text>
          <TextInput
            scrollEnabled={false}
            value={state.judgingNotes}
            onChangeText={(judgingNotes) => setState({ ...state, judgingNotes })}
            placeholder="Enter the notes how the event will be judged"
            textAlignVertical="top"
            multiline
            style={{
              backgroundColor: '#eee',
              minHeight: RFValue(200),
              maxHeight: RFValue(200),
              marginVertical: RFValue(10),
              fontSize: RFValue(14),
              paddingHorizontal: RFValue(10),
              paddingTop: RFValue(10)
              // maxHeight: RFValue(200)
            }}
          />

          <Text style={{ fontSize: RFValue(14) }}>Enter event description:</Text>
          <TextInput
            scrollEnabled={false}
            value={state.description}
            onChangeText={(description) => setState({ ...state, description })}
            placeholder="Enter a brief description of this event..."
            multiline
            style={{
              backgroundColor: '#eee',
              minHeight: RFValue(200),
              maxHeight: RFValue(200),
              marginVertical: RFValue(10),
              fontSize: RFValue(14),
              paddingHorizontal: RFValue(10),
              paddingTop: RFValue(10)

              // maxHeight: RFValue(200)
            }}
          />

          {/* <Pressable
            onPress={createEvent}
            loading
            style={{
              backgroundColor: '#010203',
              height: RFValue(50),
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontSize: RFValue(16), fontWeight: 'bold' }}>Create event</Text>
          </Pressable> */}
          <Button
            title="Create event"
            onPress={createEvent}
            loading={loading.createEvent || imageLoading}
            extStyles={{ backgroundColor: '#000' }}
            textStyles={{ color: '#fff' }}
          />
        </View>
        {/* end freee */}
      </KeyboardAwareScrollView>
      {/* </View> */}
    </View>
  );
};

export default NewEvent;
