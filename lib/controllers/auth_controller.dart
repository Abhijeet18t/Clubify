import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:workflow/views/clubs/club_skeleton.dart';
import 'package:workflow/views/tab_view.dart';

class AuthController extends GetxController {
  static const IP_SERVER = '192.168.0.11';

  void loginUser(String phone, String password) async {
    try {
      print("inside");
      if (phone.isEmpty || password.isEmpty) {
        Get.snackbar('error signing in', 'username or password field empty');
      } else {
        var response = await http.post(
            "https://clubify-node.herokuapp.com/login",
            body: {'phone': phone, 'password': password});
        print("outside");
        if (response.statusCode == 200) {
          final body = jsonDecode(response.body);
          print(body);
          SharedPreferences sharedPreferences =
              await SharedPreferences.getInstance();
          sharedPreferences.setString('token', body['accessToken']);
          sharedPreferences.setBool('login-stat', true);
          print(sharedPreferences.getString('token'));
          Get.off(ClubHome());
        } else {
          var body = jsonDecode(response.body);
          Get.snackbar('error signing In', body,
              snackPosition: SnackPosition.TOP);
        }
      }
    } catch (error) {
      print(error.message);
      Get.snackbar('Error signing In', error.message,
          snackPosition: SnackPosition.TOP);
    }
  }

  void logoutUser() async {
    try {
      var response =
          await http.delete("https://clubify-node.herokuapp.com/logout");
      if (response.statusCode == 200) {
        SharedPreferences sharedPreferences =
            await SharedPreferences.getInstance();
        sharedPreferences.clear();
        // sharedPreferences.commit();
        Get.offAll(TabPage());
      } else {
        Get.snackbar('error Logging Out', response.body);
      }
    } catch (error) {
      Get.snackbar('Error Logging Out', error.message);
    }
  }
}
