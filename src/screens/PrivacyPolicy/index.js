/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Dimensions, ScrollView, Alert, RefreshControl } from 'react-native';
import { observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-elements';
import { Loading, Header, Text } from '../../components';
import { constants } from '../../resources';
import { getFollowingLiveData, getFollowingUserPosts } from '../../services';
import Store from '../../store/Store';
import { followerCount } from '../../lib';
import { StackActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            refreshing: false,
        };
    }

    componentDidMount = async () => {

        this.setState({ loading: false });
    }

    render() {
        const { loading, refreshing } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: constants.BACKGROUND_COLOR }}>
                <Header
                    leftButtonPress={() => this.props.navigation.dispatch(StackActions.pop())}
                    leftButtonIcon="chevron-left"
                    title='Privacy Policy - Terms & Conditions'
                />
                {
                    loading ?
                        <Loading
                            loadingStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            textStyle={{ marginTop: 10, fontWeight: 'normal' }}
                            text="Loading"
                        />
                        :
                        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} tintColor="white" />}>
                            <View style={{ width: width, paddingHorizontal: 20, marginTop: 10 }}>
                                <Text
                                    text="Privacy Policy"
                                    style={{ fontSize: 20 }}
                                />
                                <Text
                                    text={`
Backstage Technology, Inc. (“Backstage” is a platform where fans can support and engage with content creators. This Privacy Policy applies to fans, creators, and all users of our platform, and is part of our Terms of Use. Backstage operates the joinbackstage.co website and associated apps, providing a social platform that connects content creators with their fans and including all pages within this website and all pages within any app produced by Backstage (the “Service”).

Please review the following to understand how we process and safeguard personal data about you. By using any of our Services, whether by visiting our website or otherwise, and/or by voluntarily providing personal data to us, you acknowledge that you have read and understand the practices contained in this Privacy Policy. This Privacy Policy may be revised from time to time, so please ensure that you check this Privacy Policy periodically to remain fully informed.

**Information Collection**

We collect the following types of information about you:

(1) information you choose to give us;

(2) information we get when you use the Service

(3) information we get from third parties.

**(1) Information You Choose to Give to Us**

We collect information you provide directly to us. For example, you may provide us with information through your:

- Requests or questions you submit to us via online forms, email, or otherwise;
- Account registration and administration of your account;
- Uploading or posting of User Content;

**The types of data we collect directly from you include:**

- Registration and Profile Information.

When you create an account, we may collect your personal information, such as your username, first and last name, email address, mobile phone number and a photo, if you choose to have one associated with your account.

- Messages and User Content.

We collect information when you message us or other users through use of the Service. We may retain any messages you send to us or through use of the Service. We use this information to operate, maintain, and provide to you the features and functionality of the Service, including customer support.

**(2) Information We Get When You Use the Service**

- Cookies, Log Data and other tracking technologies: When you use our Service, we and our business partners may collect certain information about your computer or device through technology such as cookies, web beacons, log files, or other tracking/recording tools. The information we collect through the use of tracking technologies includes, but is not limited to, IP address, browser information, referring/exit pages and URLs, click stream data and information about how you interact with links on the website, mobile app, or Service, domain names, landing pages, page views, cookie data that allows us to uniquely identify your browser and track your behavior on our site, mobile device type, mobile device IDs or other persistent identifiers, and location data collected from your mobile device. Some or all of this data may be combined with other information described above. When you access our Service by or through a mobile device, we may receive or collect and store a unique identification numbers associated with your device or our mobile application (including, for example, a UDID, Unique ID for Advertisers (“IDFA”), Google Ad ID, or Windows Advertising ID or other identifier), mobile carrier, device type, model and manufacturer, mobile device operating system brand and model, phone number, and, depending on your mobile device settings, your geographical location data, including GPS coordinates (e.g. latitude and/or longitude), WiFi location or similar information regarding the location of your mobile device. You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose to refuse our cookies, you may not be able to use some portions of our Service.
- Analytics Data: We may also collect analytics data, or use third-party analytics tools, to help us measure traffic and usage trends for the Service. These tools collect information sent by your browser or mobile device, including the pages you visit, your use of third-party applications, and other information that assists us in analyzing and improving the Service.

**(3) Information from Third Parties**

When you interact with us through social media, we may receive information from the social network such as your profile information, profile picture, gender, user name, user ID associated with your social media account, age range, language, country, friends list, and any other information you permit the social network to share with third parties. The data we receive is dependent upon your privacy settings with the social network. You should always review, and if necessary, adjust your privacy settings on third-party websites and services before linking or connecting them to the Service. We may also collect information about you from non-affiliated third parties for fraud or safety protection purposes, or for marketing purposes. We likewise may combine information that we collect from you through the Service with information that we obtain from such third parties and information derived from any other products or services we provide.

**How We Use Information**

We may use the information we collect, alone or in combination, for various purposes, including, but not limited to providing the Service as well as the following:

- develop, operate, improve, deliver, maintain and protect our products and services.
- send you communications, including by email. We may use email to respond to support inquiries or to share information about our Service.
- monitor and analyze trends and usage.
- verify your identity and prevent fraud or other unauthorized or illegal activity.
- use information we’ve collected from cookies and other technology to enhance the Service and your experience with them.
- enforce our Terms and Conditions and other usage policies.

We may also store or use information locally on your device.

**How We May Share Information**

We may share information about you in the following ways:

- With other Users. We may share the following information with other users: (1) information you enter (2) any additional information you have consented for us to share; (3) User Content you post or send will be shared with your subscribers.
- With all Users. We may share the following information with all Users: public information such as your profile name, username and profile pictures.
- To third parties offering features through the Service. employ additional third-party companies and individuals due to the following reasons: (1) to facilitate our Service; (2) to provide the Service on our behalf; (3) to perform Service-related services; or (4) to assist us in analyzing how our Service is used.

When you use these services, you would be providing information directly to the provider of these services, and the provision of such information would be subject to such party's own privacy policy. We are not responsible for any information you provide to these parties directly, and we encourage you to become familiar with their practices before disclosing information directly to such third parties with which you come into contact. We want to inform our Service users that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are authorized not to disclose or use the information for any other purpose.

- Aggregated or anonymized information. We may also share with third parties—such as advertisers—aggregated or anonymized information.
- With third parties for legal reasons. We may share information about you if we reasonably believe that disclosing the information is needed to: comply with any valid legal process, governmental request, or applicable law, rule or regulation, investigation, remedy, or enforce potential Terms and Conditions violations; protect our, our users' or others' rights, property and safety; detect and resolve any fraud or security concerns.

**Payment Provider**

We use a third-party payment processor to process payments made to us. In connection with the processing of such payments, we do not retain any personally identifiable information or any financial information such as credit card numbers. Rather, all such information is provided directly to our third-party processor, Stripe, whose use of your personal information is governed by their privacy policy, which may be viewed at [https://stripe.com/us/privacy](https://stripe.com/us/privacy).

**Security**

We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. However, we cannot guarantee its absolute security.

**Links to Other Sites**

Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over, and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

**Children's Privacy**

Our Services do not address anyone under the age of 13. We do not knowingly collect personal identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.

**Contact Us**

If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
                                    `}
                                    style={{ fontSize: 12, fontWeight: 'normal' }}
                                />
                                 <Text
                                    text="Terms & Conditions"
                                    style={{ fontSize: 20 }}
                                />
                                 <Text
                                    text={`
1. Introduction. These Standard Terms and Conditions (these “Terms” or these “Standard Terms and Conditions”) contained herein on this webpage, shall govern your use of this website and associated apps, including all pages within this website and all pages within any app produced by Backstage Technology, Inc. (collectively referred to herein below as this “Service”). These Terms apply in full force and effect to your use of this Service and by using this Service, you expressly accept all terms and conditions contained herein in full. You must not use this Service, if you have any objection to any of these Service Standard Terms and Conditions. This Service is not for use by anyone who is not at least 13 years of age, and you must not use this Service if you are a minor. By using the Service, you agree to share your legal name with the Service for legal purposes on any payment methods you use to transact on the Service.
2. Intellectual Property Rights. Other than user-generated content (see clause 3), under these Terms, Backstage Technology, Inc. (“Backstage”) and/or its licensors own all rights to the intellectual property and material contained in this Service, and all such rights are reserved. You are granted a limited license only, subject to the restrictions provided in these Terms, for purposes of viewing the material contained on this Service.
3. Your Content. “User Content” shall mean any audio, video, text, images or other material you choose to display on this Service. With respect to User Content, by displaying it, you grant Backstage a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.

3.1 By creating and publishing User Content on Backstage, you authorize users to access and view (without downloading or copying) your User Content on Backstage for their own lawful and personal use. You also represent, warrant and undertake that for each submission: (1) you own, have a valid license to, or otherwise control all rights in and to your User Content; (2) to the extent your User Content includes or uses any third-party property, you have secured all rights, licenses, written consents and releases that are necessary for the use of such third-party property in your User Content; and (3) you will not post any content depicting any person under 18-years old, you have inspected and are maintaining written documentation sufficient to confirm that all subjects of your submission are in fact 18-years old or older.

3.2 Leaked content. Backstage will take disciplinary action against any users who maliciously or unintentionally leak any other user's "exclusive content" (defined as 1. any content sent by another user within a private message, or 2. any content that a user posts on their own private, subscriber-only feed). Leak is defined as any intentional or unintentional posting and spreading of exclusive content to any platform or medium, including within Backstage on public feeds or other fan communities. For every individual leak (one piece of content such as one image or one video) identified and confirmed by Backstage's digital watermarks, Backstage reserves the right to charge the violator up to $5,000 in fines as reparation to the user whose content was leaked.

3.3 Copyright Disputes and DMCA Takedowns. In the case that a copyright violation occurs and is hosted on the Backstage platform, the copyright owner should contact Backstage’s agent to receive notification of infringement, at contact@joinbackstage.co. The format for requesting such a claim can be found at https://www.copyright.gov/dmca-directory/. Once the claim is validated, Backstage will respond expeditiously to remove, or disable access to, the material that is claimed to be infringing or to be the subject of the infringing activity. Backstage itself will be subject to DMCA's infringement safe harbor regulations for online service providers. Please note that, under the DMCA, any person who knowingly makes material misrepresentations in a notification of claimed infringement or in a counter-notification may be liable for damages.

1. Acceptable Use. Backstage requires that all users respect and comply with the Terms below, at all times, when using this Service.

4.1 Certain areas of this Service are restricted from access by you and Backstage may further restrict access by you to any areas of this Service, at any time, in its sole and absolute discretion. Any user ID and password you may have for this Service are confidential and you must maintain confidentiality of such information. You may not: (1) use Backstage other than for your own lawful and personal use in accordance with these Terms; (2) impersonate Backstage, a Backstage employee, another user, or any other person or entity or falsely state, suggest or otherwise misrepresent any affiliation, endorsement, sponsorship between you and Backstage and/or any other person or entity; (3) falsify account registration information, or make unauthorized use of another's information or content; (4) use Backstage in any manner or for any purpose that is illegal or unlawful, including engaging in any activity that violates any right of any person or entity; (5) copy, reproduce, distribute, sell, commercialize, sublicense, modify, or create derivative works from, any portion of this Service or any content on this Service without Backstage’s express written permission; (6) use Backstage for the purpose of exploiting, harming, or attempting to exploit or harm minors in any way, including by exposing them to inappropriate content, asking for personally identifiable information, or otherwise; (7) publish any Service material in any media; (8) publicly perform and/or show any Service material; (9) use this Service to engage in any advertising or marketing; (10) use this Service in any way that is, or may be, damaging to this Service; (11) engage in any data mining, data harvesting, data extracting or any other similar activity in relation to this Service, or while using this Service or (12) engage in any other conduct that restricts or inhibits anyone’s use or enjoyment of the Service, or which, as determined by Backstage, may harm Backstage or users of the Service or expose them to liability.

4.2 There is no tolerance for objectionable content or abusive users. You shall not create, upload, post, display, publish or distribute User Content that: (1) is obscene, illegal, fraudulent, defamatory, libelous, hateful, discriminatory, threatening or harassing, or in any way which incites violence or violates any of the aforementioned prohibitions; (2) violates another's copyright, trademark, right of privacy, right of publicity, or other property or personal right; (3) promotes or advertises firearms or other weapons, drugs, or drug paraphernalia; (4) promotes any illegal activity, or advocates, promotes, or assists any unlawful act; (5) is pornographic and/or other obscene in nature (including literature, imagery and other media) or depicts nudity or explicit sexual acts on any part of the website or app; (6) involves 3rd party commercial activities or sales, such as contests, sweepstakes and other sales promotions, barter, or advertising; (7) gives the impression that it emanates from or is endorsed by Backstage or any other person or entity, if this is not the case; (8) solicits other users for any paid services including solicitating for subscriptions, or content that can be perceived as spam. Backstage developers will act on objectionable content reports within 24 hours by removing the content and ejecting the user who provided the offending content.

4.3 You shall not remove, erase, modify or tamper with any copyright, trademark or other proprietary rights notice that is contained in any content on this Service that you do not own.

4.4 You shall not use this Service for any unauthorized purpose, including, without limitation, for purposes of building a competitive product or service, performance or functionality, or for any other competitive purposes.

4.5 You shall not use any automated program, tool or process (including without limitation, web crawlers, robots, bots, spiders, and automated scripts) to access this Service or any server, network or system associated with Backstage, or to extract, collect, harvest or gather content or information from Backstage.

4.6 You shall not make any other use of this Service that violates these Terms or any applicable law.

1. Payment. When you provide payment information, you represent and warrant that the information is accurate, that you are authorized to use the payment method provided, and that you will notify us of changes to the payment information. We reserve the right to utilize third party credit card updating services to obtain current expiration dates on credit cards. Backstage uses the 3rd party payment platform Stripe and by using this Service and agreeing to Backstage’s Terms of Service, you also agree to be bound by Stripe’s Terms of Service. You expressly understand and agree that Backstage shall not be liable for any payments and monetary transactions that occur through your use of the Service. You expressly understand and agree that all payments and monetary transactions are handled by Stripe. You agree that Backstage shall not be liable for any issues regarding financial and monetary transactions between you and any other party, including Stripe. You are responsible for all transactions (one-time, recurring, and refunds) processed through the Service and/or Stripe. Backstage is not liable for loss or damage from errant or invalid transactions processed with your Stripe account. This includes transactions that were not processed due to a network communication error, or any other reason. If you process a transaction, it is your responsibility to verify that the transaction was successfully processed. You must not process stolen credit cards, or unauthorized credit cards through Stripe and/or your Backstage account.
2. Disclaimer; Limitations of Liability. By using this Service, you acknowledge and agree as follows:

6.1 YOU AGREE THAT YOUR USE OF THE SERVICE SHALL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, BACKSTAGE AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THIS SERVICE AND YOUR USE THEREOF, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, PRIVACY, SECURITY, OR NON-INFRINGEMENT. BACKSTAGE ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES IN THIS SERVICE, CONTENT ON THIS SERVICE OR RESULTS THAT ARE OBTAINED FROM USE OF THIS SERVICE, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THIS SERVICE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF BACKSTAGE’S SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THIS SERVICE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THIS SERVICE BY ANY THIRD PARTY, AND/OR (6) OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THIS SERVICE. WE ARE NOT RESPONSIBLE FOR AND ARE NOT OBLIGATED TO CONTROL THE ACTIONS OF, OR INFORMATION PROVIDED BY (INCLUDING CONTENT), OUR USERS OR OTHER THIRD PARTIES.

6.2 IN NO EVENT SHALL BACKSTAGE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY (1) ERRORS, MISTAKES, OR INACCURACIES IN THIS SERVICE, CONTENT ON THIS SERVICE OR RESULTS THAT ARE OBTAINED FROM USE OF THE SERVICE, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THIS SERVICE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF BACKSTAGE’S SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THIS SERVICE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THIS SERVICE BY ANY THIRD PARTY, AND/OR (6) OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE THIS SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE LIABILITY RELATING TO, ARISING OUT OF, OR IN ANY WAY IN CONNECTION WITH THESE TERMS AND/OR THIS SERVICE WILL NOT EXCEED THE GREATER OF ONE HUNDRED DOLLARS ($100) OR THE AMOUNT YOU PAID TO US HEREUNDER IN THE SIX MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY. THE FOREGOING LIMITATION OF LIABILITY SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW IN THE APPLICABLE JURISDICTION.

1. Indemnification. You hereby agree to indemnify to the fullest extent Backstage from and against any and all liabilities, costs, demands, causes of action, damages and expenses (including reasonable attorney’s fees) arising out of or in any way related to any of the following: (1) your use of this Service or any of its features; (2) User Content created, published, or otherwise made available on Backstage by you; (3) any transaction or interaction between you and any other user of Backstage; and/or (4) your breach of any of the provisions of these Terms.
2. Severability. If any provision of these Terms is found to be unenforceable or invalid under any applicable law, such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a whole, and such provisions shall be deleted without affecting the remaining provisions herein.
3. Variation of Terms. Backstage is permitted to revise these Terms at any time as it sees fit, and by using this Service you are expected to review such Terms on a regular basis to ensure you understand all terms and conditions governing use of this Service.
4. No Waiver. No waiver of any provision of these Terms by us shall be deemed a further or continuing waiver of such provision or any other provision, and our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
5. Assignment. Backstage shall be permitted to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification or consent required. However, you shall not be permitted to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.
6. Entire Agreement. These Terms, including any legal notices and disclaimers contained on this Service, constitute the entire agreement between Backstage and you in relation to your use of this Service, and supersede all prior agreements and understandings with respect to the same.
7. Governing Law and Jurisdiction. These Terms will be governed by and construed in accordance with the laws of the State of California, and you submit to the exclusive jurisdiction of the state and federal courts located in California for the resolution of any disputes.
                                    `}
                                    style={{ fontSize: 12, fontWeight: 'normal' }}
                                />
                            </View>
                        </ScrollView>
                }
            </View>
        );
    }
}

export default observer(Home);
