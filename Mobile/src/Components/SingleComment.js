import moment from 'moment';
import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { CONSTANTS } from '../Utils';

const SingleComment = ({
  imageUrl,
  comment,
  dateCreated,
  goto,
  owner,
  last,
  first,
  navigation: { navigate },
  _id,
  blog,
  user,
  ...rest
}) => {
  return (
    <View style={{ paddingTop: first ? RFValue(10) : 0, borderWidth: 0, marginBottom: RFValue(20) }}>
      <View
        style={{
          width: '100%',
          // maBottom: RFValue(15),
          flexDirection: 'row',
          paddingHorizontal: RFValue(10),
          backgroundColor: '#fff'
        }}
        // key={() => HelperFunctions.keyGenerator()}
      >
        <View style={{ width: '15%' }}>
          <Image
            source={{
              uri: user.imageUrl || CONSTANTS.DEFAULT_PROFILE
            }}
            style={{ width: RFValue(30), height: RFValue(30), borderRadius: RFValue(100) }}
          />
        </View>
        <View style={{ width: '80%' }}>
          {user && (
            <Text style={{ fontSize: RFValue(14), fontWeight: 'bold' }}>
              {user.accountType === 'individual' ? (
                `${user.name || user.username || user.email}`
              ) : (
                `${user.companyName || user.email}`
              )}
            </Text>
          )}
          <Text style={{ color: '#aaaaaa', fontSize: RFValue(13) }}>{moment(dateCreated).fromNow()}</Text>
          <Text style={{ paddingVertical: RFValue(6), fontSize: RFValue(14) }}>{comment}</Text>
        </View>
      </View>
      {/* {last && (
        <View style={{ width: '100%', backgroundColor: '#fff' }}>
          <Pressable
            onPress={() => (goto ? goto() : navigate('NewBlogComment', { blogId: _id, blog }))}
            style={{
              width: '95%',
              backgroundColor: '#000',
              height: RFValue(40),
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: RFValue(15)
            }}
          >
            <Text style={{ fontSize: RFValue(14), color: '#fff' }}>View all comments</Text>
          </Pressable>
        </View>
      )} */}
    </View>
  );
};

export default SingleComment;
