export default function isInfluencer(user) {
  return user.type === 'influencer' && user.appStoreProductId;
}
