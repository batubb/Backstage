import Store from '../store/Store';

export default function isInfluencer(user = Store.user) {
  return !!(
    user.type === 'influencer' && typeof user.appStoreProductId !== 'undefined'
  );
}
